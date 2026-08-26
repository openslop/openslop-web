import { SITE_URL } from "@/lib/constants";
import type { Doc } from "./types";

/** Site-relative markdown links become absolute so agents can follow them. */
function absolutize(text: string): string {
  return text.replace(/\]\((\/[^)]*)\)/g, `](${SITE_URL}$1)`);
}

export function docToMarkdown(doc: Doc): string {
  const lines = [`# ${doc.title}`, "", `> ${doc.description}`];

  if (doc.updated) lines.push("", `_Last updated: ${doc.updated}_`);

  for (const paragraph of doc.intro ?? [])
    lines.push("", absolutize(paragraph));

  for (const section of doc.sections) {
    lines.push("", `## ${section.heading}`);
    for (const paragraph of section.body ?? [])
      lines.push("", absolutize(paragraph));
    if (section.list) {
      lines.push("");
      for (const item of section.list) lines.push(`- ${absolutize(item)}`);
    }
  }

  lines.push("", "---", "", `Canonical URL: ${SITE_URL}${doc.path}`);
  return `${lines.join("\n")}\n`;
}
