"use client";

import WaitlistForm from "@/app/components/landing/WaitlistForm";

export default function BlogCTA() {
  return (
    <div className="not-prose my-10 rounded-xl border border-white/10 bg-white/[0.03] px-6 py-6">
      <p className="mb-4 text-base text-zinc-300">
        <span className="font-semibold text-white">OpenSlop</span> is the
        open-source pipeline that does all of this for free forever. Currently
        in beta.
      </p>
      <WaitlistForm />
    </div>
  );
}
