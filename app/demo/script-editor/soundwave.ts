import type { CSSProperties } from "react";

/** Pairs with {@link buildSoundwaveMask}: stretches the mask over the element. */
export const SOUNDWAVE_MASK_STYLE: CSSProperties = {
  maskSize: "100% 100%",
  WebkitMaskSize: "100% 100%",
  maskRepeat: "no-repeat",
  WebkitMaskRepeat: "no-repeat",
};

/** Silence still draws a hairline, so an empty stretch reads as audio, not a gap. */
const MIN_HEIGHT = 4;

const smooth = (values: number[]) =>
  values.map((value, i) => {
    const before = values[i - 1] ?? value;
    const after = values[i + 1] ?? value;
    return (before + value + after) / 3;
  });

/**
 * The waveform's envelope: heights (0–100) mirrored around the centreline into
 * one filled shape. A mask rather than a canvas, so it paints with a CSS
 * background colour and stays on the same theme tokens as the rest of the UI.
 */
export function buildSoundwaveMask(heights: number[]) {
  const samples = heights.length === 1 ? [heights[0], heights[0]] : heights;
  const step = samples.length > 1 ? 100 / (samples.length - 1) : 0;
  const at = (i: number) => (i * step).toFixed(2);
  const top = samples.map((h, i) => `${at(i)},${((100 - h) / 2).toFixed(2)}`);
  const bottom = samples
    .map((h, i) => `${at(i)},${((100 + h) / 2).toFixed(2)}`)
    .reverse();
  return `url("data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="none"><polygon points="${[...top, ...bottom].join(" ")}" fill="white"/></svg>`,
  )}")`;
}

const rand = (n: number) => {
  let h = Math.imul(n ^ (n >>> 16), 0x45d9f3b);
  h = Math.imul(h ^ (h >>> 13), 0x45d9f3b);
  return ((h ^ (h >>> 16)) >>> 0) / 0xffffffff;
};

/**
 * Stand-in for decoded audio peaks. A smoothed random walk under a sine
 * envelope, so the mock reads like a take rather than like noise.
 */
export function demoWaveMask(seed: number, samples = 96) {
  let value = 0.5;
  const heights = Array.from({ length: samples }, (_, i) => {
    value = value * 0.55 + rand(seed * 977 + i) * 0.45;
    const envelope = Math.sin((Math.PI * i) / (samples - 1)) ** 0.35;
    return Math.max(MIN_HEIGHT, (0.18 + value * 0.82) * envelope * 100);
  });
  return buildSoundwaveMask(smooth(heights));
}
