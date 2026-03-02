"use client";

import WaitlistForm from "@/app/components/landing/WaitlistForm";
import Link from "next/link";

export default function BlogCTA() {
  return (
    <div className="not-prose my-10 rounded-xl border border-white/10 bg-white/[0.03] px-6 py-6">
      <p className="mb-4 text-base text-zinc-300">
        <Link href="/" className="text-white hover:text-zinc-300">
          <span className="font-semibold text-white">OpenSlop</span>
        </Link>{" "}
        is the open-source workflow that creates ready-to-publish AI videos for{" "}
        <span className="font-semibold text-white">free forever</span>.
      </p>
      <WaitlistForm />
    </div>
  );
}
