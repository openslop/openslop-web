import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock Supabase before importing the route
const mockRpc = vi.fn();
const mockInsert = vi.fn();
const mockFrom = vi.fn(() => ({ insert: mockInsert }));

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseClient: () => ({ rpc: mockRpc, from: mockFrom }),
  createSupabaseServiceClient: () => ({ rpc: mockRpc }),
}));

import { GET, POST } from "./route";

function jsonRequest(body: unknown) {
  return new Request("http://localhost/api/waitlist", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("GET /api/waitlist", () => {
  it("returns the waitlist count", async () => {
    mockRpc.mockResolvedValue({ data: 42, error: null });
    const res = await GET();
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ count: 42 });
  });

  it("returns 0 on Supabase error", async () => {
    mockRpc.mockResolvedValue({ data: null, error: { message: "fail" } });
    const res = await GET();
    expect(await res.json()).toEqual({ count: 0 });
  });
});

describe("POST /api/waitlist", () => {
  it("rejects missing email", async () => {
    const res = await POST(jsonRequest({}));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/invalid email/i);
  });

  it("rejects invalid email", async () => {
    const res = await POST(jsonRequest({ email: "not-an-email" }));
    expect(res.status).toBe(400);
  });

  it("accepts valid email and returns 201", async () => {
    mockInsert.mockResolvedValue({ error: null });
    mockRpc.mockResolvedValue({ data: 7, error: null });

    const res = await POST(jsonRequest({ email: "test@example.com" }));
    expect(res.status).toBe(201);

    const body = await res.json();
    expect(body.message).toBe("Joined waitlist");
    expect(body.position).toBe(7);
  });

  it("normalizes email to lowercase", async () => {
    mockInsert.mockResolvedValue({ error: null });
    mockRpc.mockResolvedValue({ data: 1, error: null });

    await POST(jsonRequest({ email: "  Foo@Bar.COM  " }));
    expect(mockFrom).toHaveBeenCalledWith("waitlist");
    expect(mockInsert).toHaveBeenCalledWith({ email: "foo@bar.com" });
  });

  it("silently handles duplicate emails (code 23505)", async () => {
    mockInsert.mockResolvedValue({ error: { code: "23505" } });
    mockRpc.mockResolvedValue({ data: 3, error: null });

    const res = await POST(jsonRequest({ email: "dup@test.com" }));
    expect(res.status).toBe(201);
  });

  it("returns 500 on unexpected DB error", async () => {
    mockInsert.mockResolvedValue({
      error: { code: "42000", message: "boom" },
    });

    const res = await POST(jsonRequest({ email: "fail@test.com" }));
    expect(res.status).toBe(500);
  });

  it("rejects invalid JSON body", async () => {
    const req = new Request("http://localhost/api/waitlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "not json",
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    expect((await res.json()).error).toBe("Invalid JSON");
  });
});
