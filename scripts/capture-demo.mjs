#!/usr/bin/env node
// Records exactly one loop of the landing-page script-editor demo and encodes
// it as an animated WebP for the openslop README.
//
//   npm run dev
//   npm run capture:demo -- --out ../openslop/assets/openslop-demo.webp
//
// Chrome only paints when something changes, so screencast frames arrive at an
// uneven cadence. We keep each frame's timestamp and resample onto a fixed grid
// rather than assuming one frame per tick.

import { spawn } from "node:child_process";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { chromium } from "playwright-core";

const DEFAULTS = {
  url: "http://localhost:3000",
  out: "openslop-demo.webp",
  fps: 12,
  width: 1200,
  quality: 72,
  viewport: "1680x900",
  scale: 2,
};

function parseArgs(argv) {
  const opts = { ...DEFAULTS };
  for (let i = 0; i < argv.length; i += 2) {
    const key = argv[i].replace(/^--/, "");
    if (!(key in DEFAULTS)) throw new Error(`unknown option --${key}`);
    const raw = argv[i + 1];
    opts[key] = typeof DEFAULTS[key] === "number" ? Number(raw) : raw;
  }
  return opts;
}

function pngSize(buffer) {
  return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
}

function run(cmd, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { stdio: ["ignore", "ignore", "inherit"] });
    child.on("error", reject);
    child.on("close", (code) =>
      code === 0 ? resolve() : reject(new Error(`${cmd} exited ${code}`)),
    );
  });
}

// Hold the most recent frame for each slot on the fixed-fps grid.
function resample(frames, fps) {
  const start = frames[0].timestamp;
  const span = frames.at(-1).timestamp - start;
  const out = [];
  let cursor = 0;
  for (let i = 0; i < Math.round(span * fps); i++) {
    const t = start + i / fps;
    while (cursor + 1 < frames.length && frames[cursor + 1].timestamp <= t) {
      cursor++;
    }
    out.push(frames[cursor].data);
  }
  return out;
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  const [vw, vh] = opts.viewport.split("x").map(Number);
  const out = path.resolve(opts.out);

  const browser = await chromium.launch({ channel: "chrome" });
  const page = await browser.newPage({
    viewport: { width: vw, height: vh },
    deviceScaleFactor: opts.scale,
  });

  const frames = [];
  let cropBox;
  try {
    await page.goto(opts.url, { waitUntil: "load" });
    const demo = page.locator('[data-demo="script-editor"]');
    await demo.waitFor();

    // Start on a loop boundary so the recording opens on an empty editor.
    const startCycle = await waitForNextCycle(page, demo);
    await page.evaluate(() => window.scrollTo(0, 0));
    cropBox = await demo.boundingBox();

    const cdp = await page.context().newCDPSession(page);
    cdp.on("Page.screencastFrame", async ({ data, metadata, sessionId }) => {
      frames.push({ data: Buffer.from(data, "base64"), ...metadata });
      await cdp.send("Page.screencastFrameAck", { sessionId }).catch(() => {});
    });
    // Screencast frames default to CSS-pixel size regardless of the device
    // scale factor, so ask for the full device resolution explicitly.
    await cdp.send("Page.startScreencast", {
      format: "png",
      everyNthFrame: 1,
      maxWidth: vw * opts.scale,
      maxHeight: vh * opts.scale,
    });

    await waitForNextCycle(page, demo, startCycle);
    await cdp.send("Page.stopScreencast");
  } finally {
    await browser.close();
  }

  if (frames.length < 2) throw new Error("captured too few frames");

  // Screencast frames come back at the viewport's device pixel size, which is
  // not always viewport * deviceScaleFactor, so derive the ratio from a frame.
  const frameSize = pngSize(frames[0].data);
  const ratio = frameSize.width / vw;
  const crop = [
    Math.round(cropBox.width * ratio),
    Math.round(cropBox.height * ratio),
    Math.round(cropBox.x * ratio),
    Math.round(cropBox.y * ratio),
  ];
  if (
    crop[0] + crop[2] > frameSize.width ||
    crop[1] + crop[3] > frameSize.height
  ) {
    throw new Error(
      `demo is not fully on screen at --viewport ${opts.viewport}; use a taller one`,
    );
  }

  const grid = resample(frames, opts.fps);
  const dir = await mkdtemp(path.join(tmpdir(), "openslop-demo-"));
  try {
    await Promise.all(
      grid.map((data, i) =>
        writeFile(path.join(dir, `${String(i).padStart(5, "0")}.png`), data),
      ),
    );
    await run("ffmpeg", [
      "-y",
      "-framerate",
      String(opts.fps),
      "-i",
      path.join(dir, "%05d.png"),
      "-vf",
      `crop=${crop.join(":")},scale=${opts.width}:-2:flags=lanczos`,
      "-c:v",
      "libwebp_anim",
      "-lossless",
      "0",
      "-q:v",
      String(opts.quality),
      "-compression_level",
      "6",
      "-loop",
      "0",
      "-an",
      out,
    ]);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }

  const seconds = (grid.length / opts.fps).toFixed(1);
  console.log(
    `${out}\n${grid.length} frames, ${seconds}s at ${opts.fps}fps, ${opts.width}px wide`,
  );
}

async function waitForNextCycle(page, demo, from) {
  const previous = from ?? (await demo.getAttribute("data-cycle"));
  await page.waitForFunction(
    (before) =>
      document.querySelector('[data-demo="script-editor"]')?.dataset.cycle !==
      before,
    previous,
    { timeout: 120_000 },
  );
  return demo.getAttribute("data-cycle");
}

await main();
