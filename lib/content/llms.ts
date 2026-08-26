import { getAllPosts } from "@/lib/blog";
import { SITE_URL } from "@/lib/constants";
import { NOT_FOR, WHEN_TO_USE } from "./agents";
import { markdownFor, markdownPaths } from "./registry";
import {
  aboutDoc,
  contactDoc,
  developersDoc,
  homeDoc,
  privacyDoc,
  termsDoc,
} from "./pages";

function link(path: string, label: string, note: string): string {
  return `- [${label}](${SITE_URL}${path}): ${note}`;
}

/** llms.txt per llmstxt.org: H1, blockquote, free prose, then link sections. */
export function llmsTxt(): string {
  const posts = getAllPosts();

  return [
    "# OpenSlop",
    "",
    `> ${homeDoc.intro?.[0] ?? homeDoc.description}`,
    "",
    homeDoc.intro?.[1] ?? "",
    "",
    "## When to use OpenSlop",
    "",
    ...WHEN_TO_USE.map((item) => `- ${item}`),
    "",
    "## When not to use OpenSlop",
    "",
    ...NOT_FOR.map((item) => `- ${item}`),
    "",
    "## How to call OpenSlop",
    "",
    "- Every URL on this site answers `Accept: text/markdown`, and every path also",
    "  resolves with a `.md` suffix. Responses set `Vary: Accept`.",
    link(
      "/AGENTS.md",
      "AGENTS.md",
      "Agent instructions: when to use OpenSlop, what it cannot do, how to call it",
    ),
    link(
      "/llms-full.txt",
      "llms-full.txt",
      "Full text of every page on this site in one file",
    ),
    "",
    "## Docs",
    "",
    link(developersDoc.path, developersDoc.title, developersDoc.description),
    "- [Source code](https://github.com/openslop/openslop): The open-source pipeline, installation, and provider setup.",
    "",
    "## Pages",
    "",
    link(homeDoc.path, "Home", "Product overview and beta waitlist signup."),
    link(aboutDoc.path, "About", aboutDoc.description),
    link(contactDoc.path, "Contact", contactDoc.description),
    "",
    "## Blog",
    "",
    ...posts.map((post) =>
      link(`/blog/${post.slug}`, post.title, post.description),
    ),
    "",
    "## Optional",
    "",
    link(termsDoc.path, "Terms of Service", termsDoc.description),
    link(privacyDoc.path, "Privacy Policy", privacyDoc.description),
    link("/feed.xml", "RSS Feed", "Blog RSS feed."),
    link("/sitemap.xml", "Sitemap", "Every canonical URL on this site."),
    "",
  ].join("\n");
}

/** Every markdown document concatenated, for retrieval in a single fetch. */
export function llmsFullTxt(): string {
  const documents = markdownPaths()
    .map((path) => markdownFor(path))
    .filter((markdown): markdown is string => markdown !== null);

  return [
    "# OpenSlop - full site text",
    "",
    `> Every page on ${SITE_URL} concatenated. Generated from the same source as the HTML.`,
    "",
    documents.join("\n\n---\n\n"),
    "",
  ].join("\n");
}
