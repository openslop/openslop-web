import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  cleanup,
} from "@testing-library/react";
import { createElement, type ReactNode } from "react";

const MOTION_PROPS = [
  "animate",
  "initial",
  "transition",
  "exit",
  "whileHover",
  "whileTap",
  "variants",
  "layout",
];

// Stub framer-motion to plain elements
vi.mock("framer-motion", () => ({
  motion: new Proxy(
    {},
    {
      get: (_target, prop: string) => {
        return ({
          children,
          ...rest
        }: {
          children?: ReactNode;
          [key: string]: unknown;
        }) => {
          const safe: Record<string, unknown> = {};
          for (const [k, v] of Object.entries(rest)) {
            if (!MOTION_PROPS.some((p) => k.startsWith(p))) {
              safe[k] = v;
            }
          }
          return createElement(prop, safe, children);
        };
      },
    },
  ),
  AnimatePresence: ({ children }: { children: ReactNode }) => children,
}));

// Stub canvas-confetti
vi.mock("canvas-confetti", () => ({ default: vi.fn() }));

// Stub next/image
vi.mock("next/image", () => ({
  default: (props: Record<string, unknown>) => createElement("img", props),
}));

// Stub analytics
vi.mock("@/lib/analytics/redditPixel", () => ({
  redditInit: vi.fn(),
  redditTrack: vi.fn(),
}));

import WaitlistForm from "./WaitlistForm";

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(globalThis, "fetch").mockImplementation(async (_input, init) => {
    const url = typeof _input === "string" ? _input : (_input as Request).url;
    if (!init?.method || init.method === "GET") {
      return Response.json({ count: 50 });
    }
    if (init?.method === "POST" && url.includes("/api/waitlist")) {
      return new Response(
        JSON.stringify({ message: "Joined waitlist", position: 12 }),
        { status: 201, headers: { "Content-Type": "application/json" } },
      );
    }
    return Response.json({});
  });
});

afterEach(cleanup);

function joinButton() {
  return screen.getAllByRole("button", { name: /join beta/i })[0];
}

function emailInput() {
  return screen.getAllByPlaceholderText("Enter your email\u2026")[0];
}

describe("WaitlistForm", () => {
  it("renders the email input and join button", () => {
    render(<WaitlistForm />);
    expect(emailInput()).toBeDefined();
    expect(joinButton()).toBeDefined();
  });

  it("shows validation error for empty email", async () => {
    render(<WaitlistForm />);
    fireEvent.click(joinButton());
    expect(await screen.findByText("Please enter your email")).toBeDefined();
  });

  it("shows validation error for invalid email", async () => {
    render(<WaitlistForm />);
    fireEvent.change(emailInput(), { target: { value: "bad-email" } });
    // Use fireEvent.submit to bypass native type="email" validation in jsdom
    fireEvent.submit(emailInput().closest("form")!);
    expect(await screen.findByText("Please enter a valid email")).toBeDefined();
  });

  it("submits valid email and shows success state", async () => {
    render(<WaitlistForm />);
    fireEvent.change(emailInput(), {
      target: { value: "test@example.com" },
    });
    fireEvent.click(joinButton());

    await waitFor(() => {
      expect(screen.getAllByText(/thanks/i).length).toBeGreaterThan(0);
    });
    expect(screen.getAllByText("Tell us more").length).toBeGreaterThan(0);
  });

  it("shows error when API returns failure", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation(async (_input, init) => {
      if (init?.method === "POST") {
        return new Response(JSON.stringify({ error: "Rate limited" }), {
          status: 429,
          headers: { "Content-Type": "application/json" },
        });
      }
      return Response.json({ count: 50 });
    });

    render(<WaitlistForm />);
    fireEvent.change(emailInput(), {
      target: { value: "test@example.com" },
    });
    fireEvent.click(joinButton());

    expect(await screen.findByText("Rate limited")).toBeDefined();
  });

  it("clears error when user types again", async () => {
    render(<WaitlistForm />);
    fireEvent.click(joinButton());
    expect(await screen.findByText("Please enter your email")).toBeDefined();

    fireEvent.change(emailInput(), { target: { value: "a" } });
    expect(screen.queryByText("Please enter your email")).toBeNull();
  });
});
