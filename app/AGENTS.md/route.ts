import { agentsMarkdown } from "@/lib/content/agents";
import { MARKDOWN_HEADERS } from "@/lib/http/markdown";

export function GET() {
  return new Response(agentsMarkdown(), { headers: MARKDOWN_HEADERS });
}
