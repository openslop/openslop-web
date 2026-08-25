"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { ImagePlus, Mic, Palette, UserPlus } from "lucide-react";
import { useEffect, useRef } from "react";
import ElementCard from "./ElementCard";
import {
  ELEMENTS_BY_ID,
  SCENES,
  VISUAL_TYPES,
  formatClock,
  type DemoElement,
} from "./script";

const ASSETS = [
  { label: "Art style", icon: Palette },
  { label: "Narrator", icon: Mic },
  { label: "Takeshi", src: "/demo/avatars/takeshi.webp" },
  { label: "Ryu", src: "/demo/avatars/ryu.webp" },
  { label: "Character", icon: UserPlus },
  { label: "Reference", icon: ImagePlus },
];

function AssetChip({ label, icon: Icon, src }: (typeof ASSETS)[number]) {
  return (
    <div className="flex w-11 shrink-0 flex-col items-center gap-1">
      <div className="relative h-11 w-11 overflow-hidden rounded-lg border border-dashed border-white/15 bg-black/25">
        {src ? (
          <Image src={src} alt="" fill sizes="44px" className="object-cover" />
        ) : (
          Icon && (
            <Icon
              className="absolute inset-0 m-auto h-4 w-4 text-white/25"
              aria-hidden
            />
          )
        )}
      </div>
      <span className="w-full truncate text-center text-[9px] text-white/35">
        {label}
      </span>
    </div>
  );
}

export default function CanvasPane({
  visible,
  edits,
  morphing,
  revealing,
  generating,
  dragging,
}: {
  visible: string[];
  edits: Record<string, { text: string; model: string }>;
  morphing: string | null;
  revealing: string | null;
  generating: string[];
  dragging: string | null;
}) {
  const scroller = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scroller.current?.scrollTo({
      top: scroller.current.scrollHeight,
      behavior: "smooth",
    });
  }, [visible.length]);

  const elements = visible
    .map((id) => ELEMENTS_BY_ID.get(id))
    .filter((el): el is DemoElement => Boolean(el));

  // Scene ranges run off the visual elements, so the clock reflows as Sloppy adds shots.
  const scenes = SCENES.reduce<
    {
      id: string;
      name: string;
      items: DemoElement[];
      start: number;
      end: number;
    }[]
  >((acc, scene) => {
    const items = elements.filter((el) => el.sceneId === scene.id);
    if (items.length === 0) return acc;
    const start = acc.at(-1)?.end ?? 0;
    const visual = items
      .filter((el) => VISUAL_TYPES.includes(el.type))
      .reduce((sum, el) => sum + el.duration, 0);
    const length = visual || Math.max(...items.map((el) => el.duration));
    return [...acc, { ...scene, items, start, end: start + length }];
  }, []);

  return (
    <div
      ref={scroller}
      className="scrollbar-hide min-h-0 flex-1 overflow-y-auto p-3 [mask-image:linear-gradient(to_bottom,transparent,black_14px)]"
    >
      <h3 className="text-base font-semibold text-white/90">Neon Drift</h3>

      <p className="mt-2 mb-1.5 text-[9px] text-white/35">Assets</p>
      <div className="scrollbar-hide flex gap-2 overflow-x-auto pb-1">
        {ASSETS.map((asset) => (
          <AssetChip key={asset.label} {...asset} />
        ))}
      </div>

      <div className="mt-3 space-y-3">
        <AnimatePresence mode="popLayout">
          {scenes.map((scene) => (
            <motion.section
              key={scene.id}
              layout
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="space-y-2 rounded-xl border border-white/[0.06] p-2"
            >
              <div className="flex items-center gap-2 px-0.5">
                <span className="text-[10px] font-medium text-white/70">
                  {scene.name}
                </span>
                <span className="font-mono text-[9px] text-white/30">
                  {formatClock(scene.start)}–{formatClock(scene.end)}
                </span>
              </div>
              {scene.items.map((el) => (
                <ElementCard
                  key={el.id}
                  element={el}
                  text={edits[el.id]?.text ?? el.text}
                  model={edits[el.id]?.model ?? el.model}
                  morphing={morphing === el.id}
                  revealing={revealing === el.id}
                  generating={generating.includes(el.id)}
                  dragging={dragging === el.id}
                />
              ))}
            </motion.section>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
