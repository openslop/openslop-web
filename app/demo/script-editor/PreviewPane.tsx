"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ELEMENTS_BY_ID } from "./script";

export default function PreviewPane({ previewId }: { previewId?: string }) {
  const src = previewId ? ELEMENTS_BY_ID.get(previewId)?.media : undefined;

  return (
    <div className="hidden w-[34%] max-w-sm shrink-0 items-center border-l border-white/[0.07] p-3 xl:flex">
      <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-white/10 bg-black/50">
        <AnimatePresence mode="popLayout">
          {src && (
            <motion.video
              key={src}
              src={src}
              autoPlay
              loop
              muted
              playsInline
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0 h-full w-full object-cover"
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
