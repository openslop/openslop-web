import { llmsTxt } from "@/lib/content/llms";

export function GET() {
  return new Response(llmsTxt(), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
