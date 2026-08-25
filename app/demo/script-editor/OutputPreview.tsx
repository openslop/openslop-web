"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Play } from "lucide-react";
import { SOUNDWAVE_MASK_STYLE, demoWaveMask } from "./soundwave";
import { ELEMENT_TINTS, type DemoElement } from "./script";

/** The editor's waveform: a mirrored envelope painted through a CSS mask. */
export function Soundwave({
  seed,
  samples,
  className = "",
}: {
  seed: number;
  samples?: number;
  className?: string;
}) {
  const mask = demoWaveMask(seed, samples);
  return (
    <div
      aria-hidden
      className={`min-w-0 flex-1 bg-current ${className}`}
      style={{
        ...SOUNDWAVE_MASK_STYLE,
        maskImage: mask,
        WebkitMaskImage: mask,
      }}
    />
  );
}

function Generating({ tint }: { tint: string }) {
  return (
    <div
      className={`relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-md border border-current/40 border-dashed bg-editor-bg ${tint}`}
    >
      <motion.div
        className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-editor-fg/10 to-transparent"
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
      <div className="aspect-video w-full overflow-hidden rounded-md border border-editor-border bg-editor-bg">
        <video
          src={element.media}
          autoPlay
          loop
          muted
          playsInline
          className="h-full w-full object-cover"
        />
      </div>
    );
  }

  return (
    <div className="flex h-11 items-center gap-2 overflow-hidden rounded-md border border-editor-border bg-editor-bg px-2">
      {element.avatar ? (
        <Image
          src={element.avatar}
          alt=""
          width={28}
          height={28}
          className="h-7 w-7 shrink-0 rounded-full object-cover"
        />
      ) : (
        <Play
          className="h-3 w-3 shrink-0 fill-editor-panel text-editor-panel"
          aria-hidden
        />
      )}
      {element.name && (
        <span className={`truncate text-[11px] font-medium ${tint}`}>
          {element.name}
        </span>
      )}
      <Soundwave
        seed={element.duration}
        className={`h-5 min-w-8 ${element.avatar ? tint : "text-editor-muted"}`}
      />
      {!element.avatar && (
        <span className="hidden shrink-0 font-mono text-[9px] text-editor-muted sm:inline">
          0:{String(element.duration).padStart(2, "0")}
        </span>
      )}
    </div>
  );
}
