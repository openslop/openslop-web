"use client";

import { Lock } from "lucide-react";
import AnimatedBorder from "./AnimatedBorder";
import CanvasPane from "./CanvasPane";
import PreviewPane from "./PreviewPane";
import SloppyPanel from "./SloppyPanel";
import TimelinePane from "./TimelinePane";
import { useDemoSequence } from "./useDemoSequence";

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
