"use client";

import { useState, useEffect, useRef, FormEvent } from "react";
import type { CreateTypes as ConfettiCreateTypes } from "canvas-confetti";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { redditInit, redditTrack } from "@/lib/analytics/redditPixel";
import { EMAIL_REGEX } from "@/lib/validation";
const COUNT_UP_DURATION = 600;

export default function WaitlistForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [status, setStatus] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");
  const [waitlistCount, setWaitlistCount] = useState<number | null>(null);
  const [displayCount, setDisplayCount] = useState(0);
  const [positionInLine, setPositionInLine] = useState<number | null>(null);
  const animRef = useRef<number | null>(null);

  useEffect(() => {
    fetch("/api/waitlist")
      .then((res) => res.json())
      .then((data) => {
        if (data.count) setWaitlistCount(data.count);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (waitlistCount === null) return;
    const start = performance.now();
    const target = waitlistCount;
    function step(now: number) {
      const progress = Math.min((now - start) / COUNT_UP_DURATION, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayCount(Math.round(eased * target));
      if (progress < 1) {
        animRef.current = requestAnimationFrame(step);
      }
    }
    animRef.current = requestAnimationFrame(step);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [waitlistCount]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    const trimmed = email.trim();
    if (!trimmed) {
      setError("Please enter your email");
      return;
    }
    if (!EMAIL_REGEX.test(trimmed)) {
      setError("Please enter a valid email");
      return;
    }

    redditInit(trimmed);
    setStatus("submitting");

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Something went wrong");
        setStatus("error");
        return;
      }

      const data = await res.json();
      setStatus("success");
      redditTrack("SignUp", { email });
      if (data.position) setPositionInLine(data.position);
      import("canvas-confetti").then((mod) =>
        (mod.default as unknown as ConfettiCreateTypes)({
          particleCount: 100,
          spread: 70,
          origin: { x: 0.3, y: 0.45 },
        }),
      );
    } catch {
      setError("Something went wrong. Please try again.");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="space-y-4">
        <div className="rounded-xl border border-white/10 bg-white/5 px-6 py-5 backdrop-blur-sm">
          <p className="text-lg font-semibold text-white">
            Thanks &mdash; we&apos;ll call you soon
          </p>
          <div className="mt-1 min-h-5">
            <AnimatePresence>
              {positionInLine !== null && (
                <motion.p
                  initial={{ opacity: 0, y: 6, filter: "blur(4px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  transition={{ duration: 0.5, ease: "easeOut", delay: 1 }}
                  className="text-sm text-zinc-400"
                >
                  You&apos;re{" "}
                  <span className="text-white font-medium">
                    #{positionInLine}
                  </span>{" "}
                  in line
                </motion.p>
              )}
            </AnimatePresence>
          </div>
          <div className="mt-3 flex flex-col sm:flex-row sm:items-center gap-3">
            <p className="text-sm text-zinc-400">Want priority access?</p>
            <a
              href="https://form.typeform.com/to/WMzi15z4"
              target="_blank"
              rel="noopener noreferrer"
              className="cta-glow inline-block rounded-xl px-6 py-3 font-semibold text-white cursor-pointer"
            >
              Tell us more
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={3}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="inline-block w-5 h-5 ml-1 -mt-0.5"
                aria-hidden="true"
              >
                <path d="M5 12h14M13 5l7 7-7 7" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col sm:flex-row sm:items-start gap-3"
      >
        <div className="flex-1 min-w-0">
          <input
            type="email"
            name="email"
            autoComplete="email"
            spellCheck={false}
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (error) setError("");
            }}
            placeholder="Enter your email…"
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-zinc-500 outline-none transition-colors focus-visible:border-violet-500/50 focus-visible:ring-1 focus-visible:ring-violet-500/50"
          />
          {error && <p className="mt-1.5 text-sm text-red-400">{error}</p>}
        </div>
        <button
          type="submit"
          disabled={status === "submitting"}
          className="cta-glow shrink-0 rounded-xl px-6 py-3 font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {status === "submitting" ? "Joining\u2026" : "Join Beta"}
        </button>
      </form>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex -space-x-2 shrink-0">
          {[1, 2, 3, 4].map((i) => (
            <Image
              key={i}
              src={`/avatars/avatar-${i}.webp`}
              alt=""
              width={32}
              height={32}
              className="rounded-full ring-2 ring-[#0a0a0a] object-cover"
            />
          ))}
        </div>
        <p className="text-sm text-zinc-400">
          Join{" "}
          <span className="text-white font-medium">
            {waitlistCount !== null ? `${displayCount}+` : ""}
          </span>{" "}
          creators on the waitlist
        </p>
      </div>
    </div>
  );
}
