import { describe, it, expect, vi, beforeEach } from "vitest";
import path from "path";

// Mock fs before importing blog module
const MOCK_FILES: Record<string, string> = {};

vi.mock("fs", () => ({
  default: {
    readdirSync: (dir: string) => {
      if (dir.includes("content/blog")) {
        return Object.keys(MOCK_FILES);
      }
      return [];
    },
    readFileSync: (_filePath: string) => {
      const filename = path.basename(_filePath);
      if (MOCK_FILES[filename]) return MOCK_FILES[filename];
      throw new Error(`ENOENT: no such file: ${_filePath}`);
    },
  },
}));

function setMockFiles(files: Record<string, string>) {
  Object.keys(MOCK_FILES).forEach((k) => delete MOCK_FILES[k]);
  Object.assign(MOCK_FILES, files);
}

// Must re-import each test to reset module-level cache
async function importBlog() {
  vi.resetModules();
  return await import("./blog");
}

const FRONTMATTER_A = `---
title: "Post A"
description: "Description A"
date: "2026-03-15"
author: "Author A"
authorAvatar: "/avatars/a.webp"
coverImage: "/blog/a.webp"
category: "Research"
tags: ["tag1", "tag2"]
---
Content A`;

const FRONTMATTER_B = `---
title: "Post B"
description: "Description B"
date: "2026-04-01"
author: "Author B"
authorAvatar: "/avatars/b.webp"
coverImage: "/blog/b.webp"
coverGif: "/blog/b.gif"
category: "Guide"
tags: ["tag3"]
---
Content B`;

const FRONTMATTER_NO_OPTIONAL = `---
title: "Post C"
description: "Description C"
date: "2026-01-01"
author: "Author C"
authorAvatar: "/avatars/c.webp"
coverImage: "/blog/c.webp"
---
Content C`;

beforeEach(() => {
  setMockFiles({});
});

describe("getAllPosts", () => {
  it("returns posts sorted by date (newest first)", async () => {
    setMockFiles({
      "post-a.mdx": FRONTMATTER_A,
      "post-b.mdx": FRONTMATTER_B,
    });
    const { getAllPosts } = await importBlog();
    const posts = getAllPosts();

    expect(posts).toHaveLength(2);
    expect(posts[0].slug).toBe("post-b");
    expect(posts[1].slug).toBe("post-a");
  });

  it("derives slug from filename", async () => {
    setMockFiles({ "my-cool-post.mdx": FRONTMATTER_A });
    const { getAllPosts } = await importBlog();
    const posts = getAllPosts();

    expect(posts[0].slug).toBe("my-cool-post");
  });

  it("parses frontmatter fields correctly", async () => {
    setMockFiles({ "post-b.mdx": FRONTMATTER_B });
    const { getAllPosts } = await importBlog();
    const post = getAllPosts()[0];

    expect(post.title).toBe("Post B");
    expect(post.description).toBe("Description B");
    expect(post.date).toBe("2026-04-01");
    expect(post.author).toBe("Author B");
    expect(post.authorAvatar).toBe("/avatars/b.webp");
    expect(post.coverImage).toBe("/blog/b.webp");
    expect(post.coverGif).toBe("/blog/b.gif");
    expect(post.category).toBe("Guide");
    expect(post.tags).toEqual(["tag3"]);
  });

  it("handles missing optional fields with defaults", async () => {
    setMockFiles({ "post-c.mdx": FRONTMATTER_NO_OPTIONAL });
    const { getAllPosts } = await importBlog();
    const post = getAllPosts()[0];

    expect(post.coverGif).toBeUndefined();
    expect(post.category).toBe("");
    expect(post.tags).toEqual([]);
  });

  it("ignores non-mdx files", async () => {
    setMockFiles({
      "post-a.mdx": FRONTMATTER_A,
      "draft.md": FRONTMATTER_B,
      "notes.txt": "hello",
    });
    const { getAllPosts } = await importBlog();
    const posts = getAllPosts();

    expect(posts).toHaveLength(1);
    expect(posts[0].slug).toBe("post-a");
  });

  it("returns empty array when no posts exist", async () => {
    setMockFiles({});
    const { getAllPosts } = await importBlog();

    expect(getAllPosts()).toEqual([]);
  });

  it("caches results on subsequent calls", async () => {
    setMockFiles({ "post-a.mdx": FRONTMATTER_A });
    const { getAllPosts } = await importBlog();

    const first = getAllPosts();
    const second = getAllPosts();
    expect(first).toBe(second); // same reference = cached
  });
});

describe("getPostBySlug", () => {
  it("returns post with content", async () => {
    setMockFiles({ "post-a.mdx": FRONTMATTER_A });
    const { getPostBySlug } = await importBlog();
    const post = getPostBySlug("post-a");

    expect(post).not.toBeNull();
    expect(post!.title).toBe("Post A");
    expect(post!.content).toBe("Content A");
  });

  it("returns null for non-existent slug", async () => {
    setMockFiles({});
    const { getPostBySlug } = await importBlog();

    expect(getPostBySlug("does-not-exist")).toBeNull();
  });

  it("caches results on subsequent calls", async () => {
    setMockFiles({ "post-a.mdx": FRONTMATTER_A });
    const { getPostBySlug } = await importBlog();

    const first = getPostBySlug("post-a");
    const second = getPostBySlug("post-a");
    expect(first).toBe(second);
  });
});

describe("formatDate", () => {
  it("formats date strings to 'Month Day, Year' format", async () => {
    const { formatDate } = await importBlog();

    // Use T12:00 to avoid timezone edge cases shifting the day
    expect(formatDate("2026-03-15T12:00:00")).toBe("March 15, 2026");
    expect(formatDate("2026-01-01T12:00:00")).toBe("January 1, 2026");
    expect(formatDate("2025-12-25T12:00:00")).toBe("December 25, 2025");
  });
});
