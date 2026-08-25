"use client";

import {
  Captions,
  Home,
  Lock,
  PanelsTopLeft,
  SlidersHorizontal,
} from "lucide-react";
import AnimatedBorder from "./AnimatedBorder";
import CanvasPane from "./CanvasPane";
import PreviewPane from "./PreviewPane";
import SloppyPanel from "./SloppyPanel";
import TimelinePane from "./TimelinePane";
import { useDemoSequence } from "./useDemoSequence";

const RAIL = [
  { label: "Home", icon: Home },
  { label: "Layout", icon: PanelsTopLeft },
  { label: "Captions", icon: Captions },
  { label: "Properties", icon: SlidersHorizontal },
];

function Toolbar() {
  return (
    <div className="flex shrink-0 items-center gap-2 border-b border-white/[0.07] px-3 py-2">
      <span className="flex flex-1 items-center justify-center gap-1.5 text-[10px] text-white/35">
        <Lock className="h-2.5 w-2.5" aria-hidden />
        Personal
        <span className="text-white/20">/</span>
        <span className="text-white/70">Neon Drift</span>
      </span>
      <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] text-white/60">
        Export
      </span>
    </div>
  );
}

function Rail() {
  return (
    <div className="hidden w-12 shrink-0 flex-col items-center gap-3 border-r border-white/[0.07] py-3 lg:flex">
      {RAIL.map(({ label, icon: Icon }, i) => (
        <span key={label} className="flex flex-col items-center gap-0.5">
          <Icon
            className={`h-4 w-4 ${i === 0 ? "text-white/80" : "text-white/30"}`}
            aria-hidden
          />
          <span
            className={`text-[8px] ${i === 0 ? "text-white/80" : "text-white/30"}`}
          >
            {label}
          </span>
        </span>
      ))}
    </div>
  );
}

export default function ScriptEditorDemo() {
  const demo = useDemoSequence();

  return (
    <AnimatedBorder>
      <div className="flex h-full flex-col">
        <Toolbar />
        <div className="flex min-h-0 flex-1 flex-col md:flex-row">
          <Rail />
          <SloppyPanel
            turns={demo.turns}
            thinking={demo.thinking}
            composer={demo.composer}
          />
          <div className="flex min-h-0 min-w-0 flex-1 flex-col">
            <div className="flex min-h-0 flex-1">
              <CanvasPane
                visible={demo.visible}
                edits={demo.edits}
                morphing={demo.morphing}
                revealing={demo.revealing}
                generating={demo.generating}
                dragging={demo.dragging}
              />
              <PreviewPane previewId={demo.previewId} />
            </div>
            <TimelinePane visible={demo.visible} playing={demo.playing} />
          </div>
        </div>
      </div>
    </AnimatedBorder>
  );
}
