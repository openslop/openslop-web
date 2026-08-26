import { describe, expect, it } from "vitest";
import { getAllPosts } from "@/lib/blog";
import { markdownFor, markdownPaths, normalizePath } from "./registry";
import { docs } from "./registry";

describe("normalizePath", () => {
  it("collapses suffixes and trailing slashes", () => {
    expect(normalizePath("/about.md")).toBe("/about");
    expect(normalizePath("/about/")).toBe("/about");
    expect(normalizePath("/")).toBe("/");
    expect(normalizePath("")).toBe("/");
  });
});

describe("markdownFor", () => {
  it("renders every static doc with a heading and canonical URL", () => {
    for (const doc of docs) {
      const markdown = markdownFor(doc.path);
      expect(markdown).toContain(`# ${doc.title}`);
      expect(markdown).toContain(
        `Canonical URL: https://openslop.ai${doc.path}`,
      );
    }
  });

  it("renders the blog index and each post", () => {
    const [post] = getAllPosts();
    expect(markdownFor("/blog")).toContain(post.title);
    expect(markdownFor(`/blog/${post.slug}`)).toContain(`# ${post.title}`);
  });

  it("accepts the .md suffix", () => {
    expect(markdownFor("/about.md")).toBe(markdownFor("/about"));
  });

  it("publishes the postal address on the contact page", () => {
    expect(markdownFor("/contact")).toContain(
      "555 San Antonio Rd, Mountain View, CA 94040, United States",
    );
  });

  it("returns null for unknown paths", () => {
    expect(markdownFor("/nope")).toBeNull();
    expect(markdownFor("/blog/nope")).toBeNull();
  });

  it("keeps the homepage substantial enough for agents", () => {
    expect(markdownFor("/")!.length).toBeGreaterThan(500);
  });
});

describe("markdownPaths", () => {
  it("covers the static docs plus the blog", () => {
    const paths = markdownPaths();
    expect(paths).toContain("/");
    expect(paths).toContain("/contact");
    expect(paths).toContain("/developers");
    expect(paths).toContain("/blog");
    for (const path of paths) expect(markdownFor(path)).not.toBeNull();
  });
});
