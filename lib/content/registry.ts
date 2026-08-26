import { getAllPosts, getPostBySlug } from "@/lib/blog";
import { SITE_URL } from "@/lib/constants";
import { docToMarkdown } from "./markdown";
import {
  aboutDoc,
  contactDoc,
  developersDoc,
  homeDoc,
  privacyDoc,
  termsDoc,
} from "./pages";
import type { Doc } from "./types";

export const docs: Doc[] = [
  homeDoc,
  aboutDoc,
  contactDoc,
  developersDoc,
  privacyDoc,
  termsDoc,
];

/** `/about/`, `/about.md` and `/about` all describe the same document. */
export function normalizePath(path: string): string {
  const withoutSuffix = path.replace(/\.md$/, "");
  const trimmed = withoutSuffix.replace(/\/+$/, "");
  return trimmed === "" ? "/" : trimmed;
}

/** MDX bodies embed React chart components; agents want the prose. */
function stripJsx(mdx: string): string {
  return mdx
    .split("\n")
    .filter((line) => !/^\s*<\/?[A-Z][\w.]*[^>]*>\s*$/.test(line))
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function blogIndexMarkdown(): string {
  const posts = getAllPosts();
  const lines = [
    "# OpenSlop Blog",
    "",
    "> Guides, tool reviews, and pipeline breakdowns from the OpenSlop team.",
    "",
  ];

  for (const post of posts) {
    lines.push(
      `## [${post.title}](${SITE_URL}/blog/${post.slug})`,
      "",
      `_${post.date} - ${post.author}_`,
      "",
      post.description,
      "",
    );
  }

  lines.push("---", "", `Canonical URL: ${SITE_URL}/blog`);
  return `${lines.join("\n")}\n`;
}

function blogPostMarkdown(slug: string): string | null {
  const post = getPostBySlug(slug);
  if (!post) return null;

  return [
    `# ${post.title}`,
    "",
    `> ${post.description}`,
    "",
    `_Published ${post.date} by ${post.author}_`,
    "",
    stripJsx(post.content),
    "",
    "---",
    "",
    `Canonical URL: ${SITE_URL}/blog/${post.slug}`,
    "",
  ].join("\n");
}

/** Markdown for a site path, or null when the path has no document. */
export function markdownFor(path: string): string | null {
  const normalized = normalizePath(path);

  const doc = docs.find((candidate) => candidate.path === normalized);
  if (doc) return docToMarkdown(doc);

  if (normalized === "/blog") return blogIndexMarkdown();

  const blogMatch = normalized.match(/^\/blog\/([^/]+)$/);
  return blogMatch ? blogPostMarkdown(blogMatch[1]) : null;
}

/** Every path that answers to `Accept: text/markdown`. */
export function markdownPaths(): string[] {
  return [
    ...docs.map((doc) => doc.path),
    "/blog",
    ...getAllPosts().map((post) => `/blog/${post.slug}`),
  ];
}
