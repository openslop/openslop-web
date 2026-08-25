"use client";

import { motion } from "framer-motion";
import { ChevronDown, Box } from "lucide-react";
import OutputPreview from "./OutputPreview";
import {
  ELEMENT_ICONS,
  ELEMENT_LABELS,
  ELEMENT_TINTS,
  type DemoElement,
} from "./script";

function ShimmerLines() {
  return (
    <div className="space-y-1.5 py-1">
      {[1, 0.75].map((w) => (
        <div
          key={w}
          className="shimmer-surface h-2 rounded-md"
          style={{ width: `${w * 100}%` }}
        />
      ))}
    </div>
  );
}

function WordReveal({ text }: { text: string }) {
  return (
    <>
      {text.split(" ").map((word, i) => (
        <motion.span
          key={i}
          className="mr-[0.28em] inline-block"
          initial={{ opacity: 0, y: 3, filter: "blur(4px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.3, delay: i * 0.045, ease: "easeOut" }}
        >
          {word}
        </motion.span>
      ))}
    </>
  );
}

export default function ElementCard({
  element,
  text,
  model,
  morphing,
  revealing,
  generating,
  dragging,
}: {
  element: DemoElement;
  text: string;
  model: string;
  morphing?: boolean;
  revealing?: boolean;
  generating?: boolean;
  dragging?: boolean;
}) {
  const Icon = ELEMENT_ICONS[element.type];
  const tint = ELEMENT_TINTS[element.type];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12, filter: "blur(4px)" }}
      animate={{
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        scale: dragging ? 1.015 : 1,
      }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className={`grain relative flex gap-3 rounded-xl border bg-editor-card p-2.5 ${
        dragging
          ? "z-10 border-editor-accent/60 shadow-2xl shadow-black/50"
          : "border-editor-border"
      }`}
    >
      <div className="relative z-10 flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex min-w-0 items-center gap-1.5">
          <span
            className={`inline-flex shrink-0 items-center gap-1 rounded-full bg-current/15 px-1.5 py-0.5 ${tint}`}
          >
            <Icon className="h-2.5 w-2.5" aria-hidden />
            <span className="text-[10px] font-medium">
              {ELEMENT_LABELS[element.type]}
            </span>
          </span>
          <span className="hidden min-w-0 items-center gap-1 text-[10px] text-editor-muted sm:inline-flex">
            <Box className="h-2.5 w-2.5 shrink-0" aria-hidden />
            <span className="truncate">{model}</span>
            <ChevronDown className="h-2.5 w-2.5 shrink-0" aria-hidden />
          </span>
        </div>
        <div className="rounded-md bg-editor-input p-2 text-[11px] leading-relaxed text-editor-panel">
          {morphing ? (
            <ShimmerLines />
          ) : revealing ? (
            <WordReveal text={text} />
          ) : (
            text
          )}
        </div>
      </div>

      <div className="relative z-10 w-[38%] shrink-0 self-center border-l border-editor-border pl-3">
        <OutputPreview element={element} generating={generating} />
      </div>
    </motion.div>
  );
}
