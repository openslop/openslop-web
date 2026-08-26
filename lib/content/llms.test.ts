import { describe, expect, it } from "vitest";
import { getAllPosts } from "@/lib/blog";
import { agentsMarkdown, NOT_FOR, PROVIDERS, WHEN_TO_USE } from "./agents";
import { llmsFullTxt, llmsTxt } from "./llms";
import { markdownPaths } from "./registry";

describe("llmsTxt", () => {
  const text = llmsTxt();

  it("follows the llmstxt.org shape", () => {
    expect(text.startsWith("# OpenSlop\n")).toBe(true);
    expect(text).toMatch(/\n> .+/);
  });

  it("carries when-to-use guidance", () => {
    expect(text).toContain("## When to use OpenSlop");
    expect(text).toContain("## When not to use OpenSlop");
    for (const item of WHEN_TO_USE) expect(text).toContain(item);
  });

  it("lists developer resources and every post", () => {
    expect(text).toContain("https://openslop.ai/developers");
    expect(text).toContain("https://openslop.ai/AGENTS.md");
    expect(text).toContain("https://github.com/openslop/openslop");
    for (const post of getAllPosts()) expect(text).toContain(post.title);
  });
});

describe("llmsFullTxt", () => {
  it("includes the text of every markdown document", () => {
    const text = llmsFullTxt();
    for (const path of markdownPaths())
      expect(text).toContain(`Canonical URL: https://openslop.ai${path}`);
  });
});

describe("agentsMarkdown", () => {
  const text = agentsMarkdown();

  it("states when to use, when not to, and how to call", () => {
    expect(text).toContain("## When to use OpenSlop");
    expect(text).toContain("## How to call OpenSlop");
    for (const item of [...WHEN_TO_USE, ...NOT_FOR])
      expect(text).toContain(item);
  });

  it("lists every model provider by stage", () => {
    expect(text).toContain("## Model providers");
    for (const provider of PROVIDERS) {
      expect(text).toContain(`### ${provider.stage}`);
      for (const name of provider.names) expect(text).toContain(name);
    }
    for (const name of [
      "ByteDance Seedance and Dreamina",
      "Speechify",
      "fal.ai",
      "OpenArt",
      "Higgsfield",
    ]) {
      expect(text).toContain(name);
    }
  });

  it("points agents at the markdown endpoints", () => {
    expect(text).toContain("Accept: text/markdown");
    expect(text).toContain("https://openslop.ai/llms.txt");
  });
});
