"use client";

import {
  Bot,
  Captions,
  Home,
  Lock,
  PanelsTopLeft,
  SlidersHorizontal,
  type LucideIcon,
} from "lucide-react";
import AnimatedBorder from "./AnimatedBorder";
import CanvasPane from "./CanvasPane";
import PreviewPane from "./PreviewPane";
import SloppyPanel from "./SloppyPanel";
import TimelinePane from "./TimelinePane";
import { useDemoSequence } from "./useDemoSequence";

const PANELS = [
  { label: "Layout", icon: PanelsTopLeft },
  { label: "Captions", icon: Captions },
  { label: "Properties", icon: SlidersHorizontal },
];

function RailItem({
  icon: Icon,
  label,
  selected,
}: {
  icon: LucideIcon;
  label: string;
  selected?: boolean;
}) {
  return (
    <span
      className={`flex w-full flex-col items-center gap-1 rounded-xl px-2 py-2 text-center text-[9px] font-medium ${
        selected
          ? "bg-editor-secondary font-semibold text-editor-label"
          : "text-editor-muted"
      }`}
    >
      <Icon className="h-4 w-4" aria-hidden />
      {label}
    </span>
  );
}

/** Mirrors the editor's rail: navigation up top, Sloppy pinned to the bottom. */
function Rail() {
  return (
    <nav
      aria-label="Panels"
      className="hidden w-16 shrink-0 flex-col items-center gap-0.5 px-1.5 py-3 lg:flex"
    >
      <RailItem icon={Home} label="Home" />
      <div className="my-1 h-px w-full bg-editor-border" />
      {PANELS.map((panel) => (
        <RailItem key={panel.label} {...panel} />
      ))}
      <div className="mt-auto w-full">
        <div className="my-1 h-px w-full bg-editor-border" />
        <RailItem icon={Bot} label="Sloppy" selected />
      </div>
    </nav>
  );
}

function Toolbar() {
  return (
    <div className="flex shrink-0 items-center gap-2 border-b border-editor-border px-3 py-2">
      <span className="flex flex-1 items-center justify-center gap-1.5 text-[10px] text-editor-muted">
        <Lock className="h-2.5 w-2.5" aria-hidden />
        Personal
        <span className="opacity-50">/</span>
        <span className="text-editor-fg">Neon Drift</span>
      </span>
      <span className="rounded-md border border-editor-border bg-editor-raised px-2.5 py-1 text-[10px] text-editor-panel">
        Export
      </span>
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
