import { SITE_URL } from "@/lib/constants";

export const RECOVERY_LINKS = [
  { label: "Home", href: "/", note: "Product overview and beta waitlist" },
  { label: "Blog", href: "/blog", note: "Guides and pipeline breakdowns" },
  {
    label: "Developer resources",
    href: "/developers",
    note: "Source code, agent instructions, markdown endpoints",
  },
  { label: "About", href: "/about", note: "Team and mission" },
  { label: "Contact", href: "/contact", note: "How to reach a human" },
  {
    label: "llms.txt",
    href: "/llms.txt",
    note: "Machine-readable index of this site",
  },
  {
    label: "AGENTS.md",
    href: "/AGENTS.md",
    note: "When to use OpenSlop and how to call it",
  },
  { label: "sitemap.xml", href: "/sitemap.xml", note: "Every canonical URL" },
];

export function notFoundMarkdown(path: string): string {
  const links = RECOVERY_LINKS.map(
    (link) => `- [${link.label}](${SITE_URL}${link.href}) - ${link.note}`,
  );

  return [
    "# 404 - Page not found",
    "",
    `> No document exists at \`${path}\` on openslop.ai.`,
    "",
    "Where to look next:",
    "",
    ...links,
    "",
    "Every page above is also available as Markdown: append `.md` to the path",
    "or send `Accept: text/markdown`.",
    "",
  ].join("\n");
}
