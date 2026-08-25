"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  AudioLines,
  ChevronsLeft,
  ChevronsRight,
  Film,
  Pause,
  Play,
  Volume2,
} from "lucide-react";
import { Soundwave } from "./OutputPreview";
import {
  ELEMENTS_BY_ID,
  ELEMENT_CLIP_FILLS,
  ELEMENT_TINTS,
  PLAYBACK_MS,
  VISUAL_TYPES,
  formatClock,
  type DemoElement,
} from "./script";

function Clip({ element }: { element: DemoElement }) {
  const visual = Boolean(element.media);
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.94 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.94 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      style={{ flexGrow: element.duration }}
      className={`relative flex min-w-0 basis-0 flex-col overflow-hidden rounded-md border ${ELEMENT_CLIP_FILLS[element.type]}`}
    >
      <span
        className={`truncate px-1 pt-0.5 text-[8px] font-medium ${ELEMENT_TINTS[element.type]}`}
      >
        {element.name ? `${element.name}: ${element.text}` : element.text}
      </span>
      {visual ? (
        <video
          src={`${element.media}#t=0.6`}
          muted
          playsInline
          preload="metadata"
          className="min-h-0 w-full flex-1 object-cover opacity-90"
        />
      ) : (
        <div
          className={`min-h-0 flex-1 px-1 pb-1 ${ELEMENT_TINTS[element.type]}`}
        >
          <Soundwave seed={element.duration * 13} bars={30} />
        </div>
      )}
    </motion.div>
  );
}

function Track({
  icon: Icon,
  elements,
  className,
}: {
  icon: typeof Film;
  elements: DemoElement[];
  className: string;
}) {
  return (
    <div className={`flex items-stretch gap-1.5 ${className}`}>
      <span className="flex w-7 shrink-0 items-center justify-center">
        <Icon className="h-3 w-3 text-white/30" aria-hidden />
      </span>
      <div className="flex min-w-0 flex-1 gap-1">
        <AnimatePresence mode="popLayout">
          {elements.map((el) => (
            <Clip key={el.id} element={el} />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function TimelinePane({
  visible,
  playing,
}: {
  visible: string[];
  playing: boolean;
}) {
  const elements = visible
    .map((id) => ELEMENTS_BY_ID.get(id))
    .filter((el): el is DemoElement => Boolean(el));
  const visuals = elements.filter((el) => VISUAL_TYPES.includes(el.type));
  const total = visuals.reduce((sum, el) => sum + el.duration, 0);

  return (
    <div className="hidden shrink-0 flex-col gap-1.5 border-t border-white/[0.07] p-2.5 sm:flex">
      <div className="flex items-center gap-3 px-1">
        <span className="font-mono text-[10px] text-white/70">
          0:00
          <span className="text-white/25"> / {formatClock(total)}</span>
        </span>
        <span className="rounded border border-white/10 bg-white/5 px-1.5 py-0.5 text-[9px] text-white/50">
          Scene 1
        </span>
        <span className="flex flex-1 items-center justify-center gap-3">
          <ChevronsLeft className="h-3.5 w-3.5 text-white/35" aria-hidden />
          {playing ? (
            <Pause
              className="h-3.5 w-3.5 fill-white/80 text-white/80"
              aria-hidden
            />
          ) : (
            <Play
              className="h-3.5 w-3.5 fill-white/80 text-white/80"
              aria-hidden
            />
          )}
          <ChevronsRight className="h-3.5 w-3.5 text-white/35" aria-hidden />
        </span>
        <Volume2
          className="hidden h-3.5 w-3.5 text-white/35 lg:block"
          aria-hidden
        />
      </div>

      <div className="relative flex flex-col gap-1">
        <Track icon={Film} elements={visuals} className="h-11" />
        <Track
          icon={AudioLines}
          elements={elements.filter((el) => !VISUAL_TYPES.includes(el.type))}
          className="h-8"
        />
        <div className="pointer-events-none absolute inset-y-0 right-0 left-[34px]">
          <motion.span
            className="absolute inset-y-0 w-px bg-white/80"
            animate={{ left: playing ? "100%" : "0%" }}
            transition={{ duration: PLAYBACK_MS / 1000, ease: "linear" }}
          />
        </div>
      </div>
    </div>
  );
}
