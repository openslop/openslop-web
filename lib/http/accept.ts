export const MARKDOWN_TYPE = "text/markdown";
export const HTML_TYPE = "text/html";

interface AcceptEntry {
  type: string;
  q: number;
}

export function parseAccept(header: string | null): AcceptEntry[] {
  if (!header) return [];

  return header
    .split(",")
    .map((part) => {
      const [type, ...params] = part.split(";").map((s) => s.trim());
      const qParam = params.find((p) => p.startsWith("q="));
      const q = qParam ? Number.parseFloat(qParam.slice(2)) : 1;
      return { type: type.toLowerCase(), q: Number.isNaN(q) ? 0 : q };
    })
    .filter((entry) => entry.type.length > 0);
}

/** Best q-value for a media type, optionally counting `type/*` and `*​/*`. */
function quality(
  entries: AcceptEntry[],
  mediaType: string,
  { wildcards = true } = {},
): number {
  const [group] = mediaType.split("/");
  const candidates = wildcards ? [mediaType, `${group}/*`, "*/*"] : [mediaType];

  return entries
    .filter((entry) => candidates.includes(entry.type))
    .reduce((best, entry) => Math.max(best, entry.q), 0);
}

/**
 * Markdown wins only when the client names `text/markdown` explicitly and
 * ranks it at least as high as HTML, so `Accept: *​/*` still gets the page.
 */
export function prefersMarkdown(header: string | null): boolean {
  const entries = parseAccept(header);
  const markdown = quality(entries, MARKDOWN_TYPE, { wildcards: false });
  return markdown > 0 && markdown >= quality(entries, HTML_TYPE);
}

/** True when the client accepts neither HTML nor Markdown - an RFC 9110 406. */
export function acceptsNothingWeServe(header: string | null): boolean {
  const entries = parseAccept(header);
  if (entries.length === 0) return false;
  return (
    quality(entries, HTML_TYPE) === 0 && quality(entries, MARKDOWN_TYPE) === 0
  );
}
