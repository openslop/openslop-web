"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowUp,
  Bot,
  Box,
  ChevronDown,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import OrbLoader from "./OrbLoader";
import type { Turn } from "./useDemoSequence";
import { ELEMENT_ICONS, ELEMENT_TINTS, OPENING_TURNS } from "./script";

const enter = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35, ease: "easeOut" as const },
};

/** The editor's status rows: a bare line, never a card. */
function StatusRow({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`flex items-center gap-1.5 self-start px-1 py-0.5 text-[10px] font-medium text-editor-muted ${className}`}
    >
      {children}
    </div>
  );
}

function WorkingStatus() {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setElapsed((prev) => prev + 1), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <StatusRow>
      <OrbLoader />
      <span className="shimmer">Slopping · {elapsed}s</span>
    </StatusRow>
  );
}

function TurnView({ turn }: { turn: Turn }) {
  if (turn.kind === "user") {
    return (
      <motion.p
        {...enter}
        className="ml-6 self-end rounded-xl rounded-br-sm bg-editor-generate px-3 py-2 text-[11px] leading-snug text-editor-card"
      >
        {turn.text}
      </motion.p>
    );
  }

  if (turn.kind === "tool") {
    const Icon = ELEMENT_ICONS[turn.type];
    return (
      <motion.div {...enter}>
        <StatusRow className="max-w-full">
          <ChevronRight className="h-3 w-3 shrink-0" aria-hidden />
          <Icon
            className={`h-3 w-3 shrink-0 ${ELEMENT_TINTS[turn.type]}`}
            aria-hidden
          />
          <span className="truncate">{turn.label}</span>
        </StatusRow>
      </motion.div>
    );
  }

  return (
    <motion.div {...enter} className="flex flex-col gap-1.5">
      <StatusRow>
        <ChevronRight className="h-3 w-3 shrink-0" aria-hidden />
        <Sparkles className="h-3 w-3 shrink-0" aria-hidden />
        Done thinking
      </StatusRow>
      <div className="grain relative rounded-xl rounded-bl-sm border border-editor-border bg-editor-card px-3 py-2">
        <div className="relative z-10 space-y-2">
          {turn.lines.map((line, i) => (
            <p key={i} className="text-[11px] leading-snug text-editor-panel">
              {line}
            </p>
          ))}
        </div>
      </div>
      <StatusRow>
        <Sparkles className="h-3 w-3 shrink-0" aria-hidden />
        Worked for {turn.seconds}s
      </StatusRow>
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
    <div className="order-last flex w-full shrink-0 flex-col gap-2 border-t border-editor-border p-2.5 md:order-none md:w-52 md:border-t-0 md:border-r md:p-3 lg:w-56">
      <div className="hidden shrink-0 items-center gap-1.5 md:flex">
        <Bot className="h-3.5 w-3.5 text-editor-label" aria-hidden />
        <span className="text-xs font-semibold text-editor-label">Sloppy</span>
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
            <motion.div {...enter} exit={{ opacity: 0 }} className="shrink-0">
              <WorkingStatus />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="shrink-0 space-y-2 rounded-xl border border-editor-border bg-editor-raised p-2">
        <div className="flex min-h-[18px] items-center rounded-md border border-editor-accent bg-editor-bg px-2 py-1">
          <span className="truncate text-[11px] text-editor-panel">
            {composer || (
              <span className="text-editor-muted/70">
                Write or change the script…
              </span>
            )}
          </span>
          <motion.span
            className="ml-px inline-block h-3 w-px shrink-0 bg-editor-accent"
            animate={{ opacity: [1, 0, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="flex min-w-0 items-center gap-1 text-[10px] text-editor-muted">
            <Box className="h-2.5 w-2.5 shrink-0" aria-hidden />
            <span className="truncate">Slop LLM v1</span>
            <ChevronDown className="h-2.5 w-2.5 shrink-0" aria-hidden />
          </span>
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-editor-accent">
            <ArrowUp className="h-3 w-3 text-white" aria-hidden />
          </span>
        </div>
      </div>
    </div>
  );
}
