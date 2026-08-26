import { describe, expect, it } from "vitest";
import { GET } from "./route";

function request(path: string) {
  return new Request(
    `http://localhost/api/md?path=${encodeURIComponent(path)}`,
  );
}

describe("GET /api/md", () => {
  it("serves markdown with Vary: Accept", async () => {
    const response = GET(request("/about"));

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toBe(
      "text/markdown; charset=utf-8",
    );
    expect(response.headers.get("Vary")).toContain("Accept");
    await expect(response.text()).resolves.toContain("# About OpenSlop");
  });

  it("answers unknown paths with a 404 markdown recovery page", async () => {
    const response = GET(request("/does-not-exist"));
    const body = await response.text();

    expect(response.status).toBe(404);
    expect(response.headers.get("Content-Type")).toBe(
      "text/markdown; charset=utf-8",
    );
    expect(body).toContain("# 404 - Page not found");
    expect(body).toContain("https://openslop.ai/sitemap.xml");
    expect(body).toContain("https://openslop.ai/llms.txt");
  });

  it("defaults to the homepage", async () => {
    await expect(
      GET(new Request("http://localhost/api/md")).text(),
    ).resolves.toContain("Canonical URL: https://openslop.ai/");
  });
});
