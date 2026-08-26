import { markdownFor, normalizePath } from "@/lib/content/registry";
import { notFoundMarkdown } from "@/lib/content/notFound";
import { MARKDOWN_HEADERS, MARKDOWN_PATH_HEADER } from "@/lib/http/markdown";

/** The rewritten path is per-request, so this must never be prerendered. */
export const dynamic = "force-dynamic";

/** Internal target of the `Accept: text/markdown` rewrite in middleware.ts. */
export function GET(request: Request) {
  const path = normalizePath(
    request.headers.get(MARKDOWN_PATH_HEADER) ??
      new URL(request.url).searchParams.get("path") ??
      "/",
  );
  const markdown = markdownFor(path);

  return new Response(markdown ?? notFoundMarkdown(path), {
    status: markdown ? 200 : 404,
    headers: MARKDOWN_HEADERS,
  });
}
