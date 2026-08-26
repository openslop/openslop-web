/** The requested page path, forwarded by the rewrite in middleware.ts. */
export const MARKDOWN_PATH_HEADER = "x-markdown-path";

export const MARKDOWN_HEADERS = {
  "Content-Type": "text/markdown; charset=utf-8",
  Vary: "Accept, Accept-Encoding",
  "Cache-Control": "public, max-age=0, must-revalidate",
};
