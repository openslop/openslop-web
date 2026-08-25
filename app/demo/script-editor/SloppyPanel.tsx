"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Bot, Box, ChevronDown, ChevronRight, ArrowUp } from "lucide-react";
import { useEffect, useRef } from "react";
import type { Turn } from "./useDemoSequence";
import { ELEMENT_ICONS, ELEMENT_TINTS, OPENING_TURNS } from "./script";

const enter = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35, ease: "easeOut" as const },
};

function TurnView({ turn }: { turn: Turn }) {
  if (turn.kind === "user") {
    return (
      <motion.p
        {...enter}
        className="ml-6 self-end rounded-xl rounded-br-sm bg-white/90 px-3 py-2 text-[11px] leading-snug text-zinc-900"
      >
        {turn.text}
      </motion.p>
    );
  }

  if (turn.kind === "tool") {
    const Icon = ELEMENT_ICONS[turn.type];
    return (
      <motion.div
        {...enter}
        className="flex items-center gap-2 rounded-lg border border-white/[0.07] bg-white/[0.03] px-2 py-1.5"
      >
        <Icon
          className={`h-3 w-3 shrink-0 ${ELEMENT_TINTS[turn.type]}`}
          aria-hidden
        />
        <span className="min-w-0 flex-1 truncate text-[10px] text-white/60">
          {turn.label}
        </span>
        <ChevronRight className="h-3 w-3 shrink-0 text-white/25" aria-hidden />
      </motion.div>
    );
  }

  return (
    <motion.div
      {...enter}
      className="space-y-2 rounded-xl rounded-bl-sm border border-white/[0.07] bg-white/[0.04] px-3 py-2"
    >
      {turn.lines.map((line, i) => (
        <p key={i} className="text-[11px] leading-snug text-white/70">
          {line}
        </p>
      ))}
    </motion.div>
  );
}

export default function SloppyPanel({
  turns,
  thinking,
  composer,
}: {
  turns: Turn[];
  thinking: boolean;
  composer: string;
}) {
  const scroller = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scroller.current?.scrollTo({
      top: scroller.current.scrollHeight,
      behavior: "smooth",
    });
  }, [turns.length, thinking]);

  return (
    <div className="order-last flex w-full shrink-0 flex-col gap-2 border-t border-white/[0.07] p-2.5 md:order-none md:w-60 md:border-t-0 md:border-r md:p-3 lg:w-64">
      <div className="hidden shrink-0 items-center gap-1.5 md:flex">
        <Bot className="h-3.5 w-3.5 text-white/80" aria-hidden />
        <span className="text-xs font-semibold text-white/90">Sloppy</span>
      </div>

      <div
        ref={scroller}
        className="scrollbar-hide hidden min-h-0 flex-1 flex-col justify-end gap-2 overflow-y-auto md:flex"
      >
        {[...OPENING_TURNS, ...turns].map((turn, i) => (
          <TurnView key={i} turn={turn} />
        ))}
        <AnimatePresence>
          {thinking && (
            <motion.div
              {...enter}
              exit={{ opacity: 0 }}
              className="flex shrink-0 items-center gap-2"
            >
              <motion.span
                className="h-2.5 w-2.5 rounded-full bg-gradient-to-br from-amber-300 to-orange-700"
                animate={{ scale: [0.8, 1.1, 0.8] }}
                transition={{ duration: 1.1, repeat: Infinity }}
              />
              <span className="text-[10px] text-white/40">Slopping…</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="shrink-0 space-y-2 rounded-xl border border-white/[0.07] bg-black/25 p-2">
        <div className="flex min-h-[18px] items-center rounded-md border border-violet-400/40 bg-black/30 px-2 py-1">
          <span className="truncate text-[11px] text-white/75">
            {composer || (
              <span className="text-white/25">Write or change the script…</span>
            )}
          </span>
          <motion.span
            className="ml-px inline-block h-3 w-px shrink-0 bg-violet-400"
            animate={{ opacity: [1, 0, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="flex min-w-0 items-center gap-1 text-[10px] text-white/35">
            <Box className="h-2.5 w-2.5 shrink-0" aria-hidden />
            <span className="truncate">Slop LLM v1</span>
            <ChevronDown className="h-2.5 w-2.5 shrink-0" aria-hidden />
          </span>
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-violet-600">
            <ArrowUp className="h-3 w-3 text-white" aria-hidden />
          </span>
        </div>
      </div>
    </div>
  );
}
