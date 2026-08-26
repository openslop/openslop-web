import { NextResponse, type NextRequest } from "next/server";
import { acceptsNothingWeServe, prefersMarkdown } from "@/lib/http/accept";
import { MARKDOWN_PATH_HEADER } from "@/lib/http/markdown";

const VARY = "Accept, Accept-Encoding";

/** Real routes that already end in `.md` and must not be treated as a suffix. */
const RESERVED_MARKDOWN_ROUTES = new Set(["/AGENTS.md"]);

/** Next's own RSC and prefetch traffic negotiates its own content types. */
function isFrameworkRequest(request: NextRequest): boolean {
  return ["RSC", "Next-Router-Prefetch", "Next-Router-State-Tree"].some(
    (header) => request.headers.has(header),
  );
}

function isNegotiable(pathname: string): boolean {
  if (pathname.startsWith("/_next") || pathname.startsWith("/api"))
    return false;
  if (RESERVED_MARKDOWN_ROUTES.has(pathname)) return false;
  const filename = pathname.split("/").pop() ?? "";
  return !filename.includes(".") || filename.endsWith(".md");
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const accept = request.headers.get("accept");

  if (
    request.method !== "GET" ||
    isFrameworkRequest(request) ||
    !isNegotiable(pathname)
  ) {
    return NextResponse.next();
  }

  if (acceptsNothingWeServe(accept)) {
    return new NextResponse(
      "406 Not Acceptable: this URL serves text/html and text/markdown.\n",
      {
        status: 406,
        headers: { "Content-Type": "text/plain; charset=utf-8", Vary: VARY },
      },
    );
  }

  if (pathname.endsWith(".md") || prefersMarkdown(accept)) {
    const headers = new Headers(request.headers);
    headers.set(MARKDOWN_PATH_HEADER, pathname);
    return NextResponse.rewrite(new URL("/api/md", request.url), {
      request: { headers },
    });
  }

  // HTML responses get `Vary: Accept` from the headers() rule in next.config.ts;
  // Next discards headers set on a middleware pass-through response.
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
