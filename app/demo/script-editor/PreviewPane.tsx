"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ELEMENTS_BY_ID } from "./script";

/** The player renders the project's 9:16 output, not the source's framing. */
export default function PreviewPane({ previewId }: { previewId?: string }) {
  const element = previewId ? ELEMENTS_BY_ID.get(previewId) : undefined;

  return (
    <div className="hidden w-[38%] max-w-72 shrink-0 items-center justify-center border-l border-editor-border p-2 xl:flex">
      <div className="relative aspect-[9/16] max-h-full w-full overflow-hidden rounded-xl border border-editor-border bg-black">
        <AnimatePresence mode="popLayout">
          {element?.media && (
            <motion.video
              key={element.media}
              src={element.media}
              autoPlay
              loop
              muted
              playsInline
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              style={{ objectPosition: element.focus }}
              className="absolute inset-0 h-full w-full object-cover"
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
