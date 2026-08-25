"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Play } from "lucide-react";
import { ELEMENT_TINTS, type DemoElement } from "./script";

/** Deterministic bar heights so the waveform is stable across renders. */
const hash = (n: number) => {
  let h = Math.imul(n ^ (n >>> 16), 0x45d9f3b);
  h = Math.imul(h ^ (h >>> 13), 0x45d9f3b);
  return (h ^ (h >>> 16)) >>> 0;
};

export function Soundwave({
  seed = 0,
  bars = 26,
  className = "",
}: {
  seed?: number;
  bars?: number;
  className?: string;
}) {
  return (
    <div
      className={`flex h-full min-w-0 flex-1 items-center gap-px overflow-hidden ${className}`}
      aria-hidden
    >
      {Array.from({ length: bars }, (_, i) => (
        <span
          key={i}
          className="w-px flex-1 rounded-full bg-current opacity-55"
          style={{ height: `${18 + (hash(seed + i) % 70)}%` }}
        />
      ))}
    </div>
  );
}

function Slot({ children }: { children: React.ReactNode }) {
  return (
    <div className="aspect-video w-full overflow-hidden rounded-lg border border-white/[0.07] bg-black/40">
      {children}
    </div>
  );
}

function Generating({ tint }: { tint: string }) {
  return (
    <div
      className={`relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-lg border border-dashed bg-black/40 ${tint} border-current/40`}
    >
      <motion.div
        className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/10 to-transparent"
        animate={{ x: ["-120%", "420%"] }}
        transition={{ duration: 1.4, repeat: Infinity, ease: "linear" }}
      />
      <span className="relative text-[10px] font-medium opacity-80">
        Generating…
      </span>
    </div>
  );
}

export default function OutputPreview({
  element,
  generating,
}: {
  element: DemoElement;
  generating?: boolean;
}) {
  const tint = ELEMENT_TINTS[element.type];

  if (generating) return <Generating tint={tint} />;

  if (element.media) {
    return (
      <Slot>
        <video
          src={element.media}
          autoPlay
          loop
          muted
          playsInline
          className="h-full w-full object-cover"
        />
      </Slot>
    );
  }

  return (
    <div
      className={`flex h-11 items-center gap-2 overflow-hidden rounded-lg border border-white/[0.07] bg-black/30 px-2 ${tint}`}
    >
      {element.avatar ? (
        <Image
          src={element.avatar}
          alt=""
          width={28}
          height={28}
          className="h-7 w-7 shrink-0 rounded-full object-cover"
        />
      ) : (
        <Play className="h-3 w-3 shrink-0 fill-current" aria-hidden />
      )}
      {element.name && (
        <span className="truncate text-[11px] font-medium">{element.name}</span>
      )}
      <Soundwave seed={element.duration * 7} />
      <span className="hidden shrink-0 font-mono text-[9px] text-white/35 sm:inline">
        0:{String(element.duration).padStart(2, "0")}
      </span>
    </div>
  );
}
