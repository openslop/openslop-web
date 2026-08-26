import type { Metadata } from "next";
import type { Doc } from "@/lib/content/types";

/** Titles that already carry the brand skip the "%s - OpenSlop" template. */
export function docMetadata(doc: Doc): Metadata {
  const title = doc.title.includes("OpenSlop")
    ? { absolute: doc.title }
    : doc.title;

  return {
    title,
    description: doc.description,
    alternates: { canonical: doc.path },
    openGraph: {
      title: doc.title,
      description: doc.description,
      url: doc.path,
    },
  };
}
