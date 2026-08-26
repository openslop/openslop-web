import { describe, expect, it } from "vitest";
import { acceptsNothingWeServe, parseAccept, prefersMarkdown } from "./accept";

describe("parseAccept", () => {
  it("reads types and q-values", () => {
    expect(parseAccept("text/markdown;q=0.9, text/html")).toEqual([
      { type: "text/markdown", q: 0.9 },
      { type: "text/html", q: 1 },
    ]);
  });

  it("returns nothing for a missing header", () => {
    expect(parseAccept(null)).toEqual([]);
  });
});

describe("prefersMarkdown", () => {
  it("serves markdown when it is named explicitly", () => {
    expect(prefersMarkdown("text/markdown")).toBe(true);
    expect(prefersMarkdown("text/markdown, text/html;q=0.5")).toBe(true);
  });

  it("honors q-values", () => {
    expect(prefersMarkdown("text/markdown;q=0.9, text/html;q=1.0")).toBe(false);
    expect(prefersMarkdown("text/markdown;q=1.0, text/html;q=0.9")).toBe(true);
    expect(prefersMarkdown("text/markdown;q=0")).toBe(false);
  });

  it("leaves wildcard and browser clients on HTML", () => {
    expect(prefersMarkdown("*/*")).toBe(false);
    expect(prefersMarkdown(null)).toBe(false);
    expect(
      prefersMarkdown("text/html,application/xhtml+xml;q=0.9,*/*;q=0.8"),
    ).toBe(false);
  });
});

describe("acceptsNothingWeServe", () => {
  it("flags clients that accept neither variant", () => {
    expect(acceptsNothingWeServe("application/json")).toBe(true);
    expect(acceptsNothingWeServe("image/png, image/webp")).toBe(true);
    expect(acceptsNothingWeServe("text/html;q=0, text/markdown;q=0")).toBe(
      true,
    );
  });

  it("accepts wildcards, HTML, markdown, and a missing header", () => {
    expect(acceptsNothingWeServe("*/*")).toBe(false);
    expect(acceptsNothingWeServe("text/*")).toBe(false);
    expect(acceptsNothingWeServe("text/html")).toBe(false);
    expect(acceptsNothingWeServe("application/json, text/markdown")).toBe(
      false,
    );
    expect(acceptsNothingWeServe(null)).toBe(false);
  });
});
