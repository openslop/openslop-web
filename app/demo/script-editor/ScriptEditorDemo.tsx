"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
  Music,
  ImageIcon,
  Volume2,
  User,
  Clapperboard,
  ChevronDown as ChevronDownIcon,
  Play,
  Settings,
  Sparkles,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

type ElementType =
  | "music"
  | "image"
  | "narration"
  | "sound"
  | "character"
  | "clip";

interface StoryElement {
  id: string;
  type: ElementType;
  text: string;
  attributes?: Record<string, string>;
  /** Model pill value (shown with dropdown chevron) */
  model?: string;
  avatar?: string;
  /** Image src for image elements */
  image?: string;
  /** Video src for clip elements */
  video?: string;
  /** Character name (for character elements — text holds the dialog) */
  characterName?: string;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const PILL_COLORS = [
  "bg-rose-500",
  "bg-blue-500",
  "bg-green-500",
  "bg-purple-500",
  "bg-orange-500",
  "bg-pink-500",
  "bg-teal-500",
  "bg-indigo-500",
];

const ELEMENT_COLORS: Record<ElementType, string> = {
  music: "bg-violet-600",
  image: "bg-cyan-600",
  narration: "bg-amber-800",
  sound: "bg-emerald-600",
  character: "bg-amber-600",
  clip: "bg-rose-600",
};

const ELEMENT_ICON_COMPONENTS: Record<
  ElementType,
  React.ComponentType<{ className?: string }> | null
> = {
  music: Music,
  image: ImageIcon,
  narration: Volume2,
  sound: Volume2,
  character: User,
  clip: Clapperboard,
};

const ELEMENT_LABELS: Record<ElementType, string> = {
  music: "Music",
  image: "Image",
  narration: "Narration",
  sound: "Sound Effect",
  character: "Character",
  clip: "Clip",
};

const NOISE_SVG = `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='3.5' numOctaves='5' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`;

// ─── (lucide icons imported above) ───────────────────────────────────────────

// ─── Initial story elements ─────────────────────────────────────────────────

const INITIAL_ELEMENTS: StoryElement[] = [
  {
    id: "music-1",
    type: "music",
    text: "Intense Japanese drum beats with electronic synth bass",
    attributes: { mood: "Intense", genre: "Electronic" },
    model: "Suno",
  },
  {
    id: "image-1",
    type: "image",
    text: "Neon-lit Tokyo street at night, rain-slicked roads reflecting city lights",
    attributes: { style: "Cinematic", animated: "Animated" },
    model: "Flux Pro Kontext",
    image: "/demo/images/tokyo-street.mp4",
  },
  {
    id: "narration-1",
    type: "narration",
    text: "The engine roared to life beneath the hood of the midnight-blue Silvia S15.",
    model: "Cartesia",
  },
  {
    id: "sound-1",
    type: "sound",
    text: "Engine revving, turbo spool",
    attributes: { timing: "Transient" },
    model: "ElevenLabs SFX",
  },
  {
    id: "narration-2",
    type: "narration",
    text: "Takeshi gripped the steering wheel, his eyes locked on the winding road ahead.",
    model: "Cartesia",
  },
  {
    id: "image-2",
    type: "image",
    text: "Takeshi and Ryu facing each other under a neon-lit overpass, tension in the air",
    attributes: { style: "Cinematic", animated: "Animated" },
    model: "Flux Pro Kontext",
    image: "/demo/images/confrontation.mp4",
  },
  {
    id: "character-1",
    type: "character",
    text: "Tonight, we settle this on the mountain pass. No rules, no limits.",
    characterName: "Takeshi",
    attributes: { gender: "Male", age: "Young adult", tone: "Confident" },
    model: "Eleven Labs",
    avatar: "/demo/avatars/takeshi.webp",
  },
  {
    id: "narration-3",
    type: "narration",
    text: "The neon signs blurred into streaks of color as the car surged forward into the Tokyo night.",
    model: "Cartesia",
  },
  {
    id: "clip-1",
    type: "clip",
    text: "POV shot from inside the car, city lights streaking past the windshield",
    attributes: { duration: "5s" },
    model: "Veo3",
    video: "/demo/videos/city-drive.mp4",
  },
];

// Phase 3 edits
const EDITED_MUSIC_TEXT =
  "Epic orchestral with aggressive taiko drums and screeching electric guitar";
const RIVAL_CHARACTER: StoryElement = {
  id: "character-2",
  type: "character",
  text: "You think you can beat me? I own these streets.",
  characterName: "Ryu",
  attributes: { gender: "Female", age: "Young adult", tone: "Menacing" },
  model: "Cartesia",
  avatar: "/demo/avatars/ryu.webp",
};
const POST_RIVAL_NARRATION: StoryElement = {
  id: "narration-5",
  type: "narration",
  text: "Ryu stepped out of the shadows, the glow of her taillights painting the alley crimson.",
  model: "Cartesia",
};
const POST_RIVAL_CHARACTER: StoryElement = {
  id: "character-3",
  type: "character",
  text: "Then let\u2019s race. Loser forfeits their keys.",
  characterName: "Takeshi",
  attributes: { gender: "Male", age: "Young adult", tone: "Determined" },
  model: "Eleven Labs",
  avatar: "/demo/avatars/takeshi.webp",
};

// Phase 5 additions
const PHASE5_ELEMENTS: StoryElement[] = [
  {
    id: "sound-2",
    type: "sound",
    text: "Tire screeching on asphalt",
    attributes: { timing: "Transient" },
    model: "ElevenLabs SFX",
  },
  {
    id: "narration-4",
    type: "narration",
    text: "The rear wheels broke loose as Takeshi yanked the handbrake, sending the car into a controlled slide.",
    model: "Cartesia",
  },
  {
    id: "image-3",
    type: "image",
    text: "Car drifting sideways through a tight corner, sparks flying",
    attributes: { style: "Dynamic", animated: "Animated" },
    model: "Leonardo",
    image: "/demo/images/drift-corner.mp4",
  },
  {
    id: "clip-2",
    type: "clip",
    text: "Slow-motion shot of the car drifting, smoke billowing from rear tires",
    attributes: { duration: "4s" },
    model: "Kling AI",
    video: "/demo/videos/drift-smoke.mp4",
  },
];

// Copilot prompts
const PROMPT_1 =
  "Create an anime story about street racing and drifting in Tokyo at night";
const PROMPT_2 = "Make the music more dramatic and add a rival character";
const PROMPT_3 = "Add a drift scene with tire screeching sounds";

// ─── Play Button ─────────────────────────────────────────────────────────────

function PlayButton({ color }: { color: string }) {
  return (
    <div
      className={`w-7 h-7 rounded-full ${color} flex items-center justify-center flex-shrink-0`}
    >
      <Play
        className="w-3 h-3 text-white fill-white ml-[1px]"
        aria-hidden="true"
      />
    </div>
  );
}

// ─── Static Soundwave Bars ───────────────────────────────────────────────────

function intHash(v: number) {
  let h = v;
  h = Math.imul(h ^ (h >>> 16), 0x45d9f3b);
  h = Math.imul(h ^ (h >>> 13), 0x45d9f3b);
  return (h ^ (h >>> 16)) >>> 0;
}

function StaticSoundwave({
  color,
  barCount = 24,
}: {
  color: string;
  barCount?: number;
}) {
  const [bars] = useState(() =>
    Array.from({ length: barCount }, (_, i) => ({
      id: i,
      h: 6 + ((intHash(i) % 29) + 1),
    })),
  );

  return (
    <div className="flex items-center gap-[2px] h-8 flex-1 min-w-0 overflow-hidden">
      {bars.map((bar) => (
        <div
          key={bar.id}
          className={`flex-1 min-w-[2px] max-w-[5px] rounded-full ${color}`}
          style={{ height: bar.h }}
        />
      ))}
    </div>
  );
}

// ─── Audio Preview (play button + static waveform) ───────────────────────────

function AudioPreview({
  buttonColor,
  barColor,
  barCount = 40,
}: {
  buttonColor: string;
  barColor: string;
  barCount?: number;
}) {
  return (
    <div className="flex items-center gap-2.5 w-full">
      <PlayButton color={buttonColor} />
      <StaticSoundwave color={barColor} barCount={barCount} />
    </div>
  );
}

// ─── Mock Media Preview (image / clip) ───────────────────────────────────────

function MockMediaPreview({
  src,
  borderColor,
}: {
  src: string;
  borderColor: string;
}) {
  return (
    <div
      className={`relative w-full aspect-video rounded-lg overflow-hidden border ${borderColor}`}
    >
      <video
        src={src}
        autoPlay
        loop
        muted
        playsInline
        className="w-full h-full object-cover"
      />
    </div>
  );
}

// ─── Mock Character Preview (avatar + name + play + soundwave) ───────────────

function MockCharacterPreview({
  name,
  avatar,
}: {
  name: string;
  avatar?: string;
}) {
  return (
    <div className="flex items-center gap-2.5 w-full">
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500/60 to-amber-700/60 border border-amber-500/30 flex-shrink-0 overflow-hidden">
        {avatar ? (
          <Image
            src={avatar}
            alt={name}
            width={40}
            height={40}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <User className="w-5 h-5 text-amber-200/60" />
          </div>
        )}
      </div>
      <span className="text-amber-200/80 text-xs font-medium flex-shrink-0">
        {name}
      </span>
      <PlayButton color="bg-amber-600" />
      <StaticSoundwave color="bg-amber-400" barCount={30} />
    </div>
  );
}

// ─── Element Card ────────────────────────────────────────────────────────────

function TextMorphLoader() {
  return (
    <div className="space-y-1.5 py-0.5">
      <motion.div
        className="h-2.5 rounded-full bg-white/10 overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
      >
        <motion.div
          className="h-full w-1/2 rounded-full bg-gradient-to-r from-transparent via-white/20 to-transparent"
          animate={{ x: ["-100%", "300%"] }}
          transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>
      <motion.div
        className="h-2.5 w-3/4 rounded-full bg-white/10 overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2, delay: 0.05 }}
      >
        <motion.div
          className="h-full w-1/2 rounded-full bg-gradient-to-r from-transparent via-white/20 to-transparent"
          animate={{ x: ["-100%", "300%"] }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.15,
          }}
        />
      </motion.div>
    </div>
  );
}

function WordByWordReveal({ text }: { text: string }) {
  const words = text.split(" ");
  return (
    <span>
      {words.map((word, i) => (
        <motion.span
          key={i}
          className="inline-block mr-[0.3em]"
          initial={{ opacity: 0, y: 4, filter: "blur(4px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{
            duration: 0.3,
            delay: i * 0.08,
            ease: "easeOut",
          }}
        >
          {word}
        </motion.span>
      ))}
    </span>
  );
}

function ElementCard({
  element,
  highlighted,
  isDragging,
  textMorph,
}: {
  element: StoryElement;
  highlighted?: boolean;
  isDragging?: boolean;
  textMorph?: "loading" | "revealing" | null;
}) {
  const bgColor = ELEMENT_COLORS[element.type];

  const IconComponent = ELEMENT_ICON_COMPONENTS[element.type];
  const label = ELEMENT_LABELS[element.type];
  const attrs = element.attributes ? Object.entries(element.attributes) : [];

  return (
    <motion.div
      className={`rounded-lg ${bgColor} p-2 shadow-md relative overflow-hidden flex-1 ${
        isDragging ? "shadow-2xl shadow-black/40 backdrop-blur-sm" : ""
      }`}
      animate={
        highlighted
          ? {
              boxShadow: [
                "0 0 0 0 rgba(167, 139, 250, 0)",
                "0 0 20px 4px rgba(167, 139, 250, 0.4)",
                "0 0 0 0 rgba(167, 139, 250, 0)",
              ],
            }
          : {}
      }
      transition={highlighted ? { duration: 1.5, repeat: 2 } : {}}
    >
      {/* Noise texture overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-80 mix-blend-overlay"
        style={{
          backgroundImage: NOISE_SVG,
          backgroundRepeat: "repeat",
          backgroundSize: "150px 150px",
        }}
      />
      <div className="relative z-10 min-w-0">
        <div className="flex items-center gap-1.5 mb-1 flex-wrap select-none">
          <div className="flex items-center gap-1 text-white font-medium">
            {IconComponent && <IconComponent className="w-3.5 h-3.5" />}
            <span className="text-xs">{label}</span>
          </div>
          {/* Character name pill */}
          {element.type === "character" && element.characterName && (
            <span className="bg-amber-700/80 text-white text-[12px] px-1.5 py-0.5 rounded-full truncate max-w-[100px]">
              {element.characterName}
            </span>
          )}
          {attrs.map(([key, value], index) => (
            <span
              key={key}
              className={`${
                PILL_COLORS[index % PILL_COLORS.length]
              } text-white text-[12px] px-1.5 py-0.5 rounded-full truncate max-w-[100px]`}
              title={value}
            >
              {value}
            </span>
          ))}
          {/* Model pill with dropdown chevron */}
          {element.model && (
            <span className="inline-flex items-center bg-white/15 text-white text-[12px] px-1.5 py-0.5 rounded-full truncate max-w-[120px]">
              {element.model}
              <ChevronDownIcon className="w-2.5 h-2.5 text-white/70 ml-0.5" />
            </span>
          )}
        </div>
        <div className="text-white/90 text-xs leading-relaxed text-left">
          {textMorph === "loading" ? (
            <TextMorphLoader />
          ) : textMorph === "revealing" ? (
            <WordByWordReveal text={element.text} />
          ) : (
            element.text
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Output Preview for an element ───────────────────────────────────────────

function OutputPreview({ element }: { element: StoryElement }) {
  switch (element.type) {
    case "music":
      return (
        <AudioPreview buttonColor="bg-violet-600" barColor="bg-violet-400" />
      );
    case "sound":
      return (
        <AudioPreview
          buttonColor="bg-emerald-600"
          barColor="bg-emerald-400"
          barCount={30}
        />
      );
    case "image":
      return (
        <MockMediaPreview
          src={element.image!}
          borderColor="border-cyan-500/30"
        />
      );
    case "clip":
      return (
        <MockMediaPreview
          src={element.video!}
          borderColor="border-rose-500/30"
        />
      );
    case "character":
      return (
        <MockCharacterPreview
          name={element.characterName ?? ""}
          avatar={element.avatar}
        />
      );
    case "narration":
      return (
        <AudioPreview
          buttonColor="bg-white/20"
          barColor="bg-white/30"
          barCount={35}
        />
      );
    default:
      return null;
  }
}

// ─── Background ──────────────────────────────────────────────────────────────

// ─── Animated Border ────────────────────────────────────────────────────────

function AnimatedBorder({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative h-full p-3 sm:p-4">
      {/* Border wrapper — p-px creates the 1px gap for the glow ring */}
      <div className="relative h-full rounded-2xl p-px overflow-hidden">
        {/* Outer glow layer — blurred version of the streak for ambient glow */}
        <div
          className="absolute -inset-[200%] animate-[border-spin_6s_linear_infinite] blur-md opacity-70"
          style={{
            background:
              "conic-gradient(from 0deg, transparent 0%, transparent 65%, rgba(167,139,250,0.6) 73%, rgba(255,255,255,0.8) 80%, rgba(167,139,250,0.6) 87%, transparent 95%, transparent 100%)",
          }}
        />
        {/* Spinning conic gradient fills the 1px gap */}
        <div
          className="absolute -inset-[200%] animate-[border-spin_6s_linear_infinite]"
          style={{
            background:
              "conic-gradient(from 0deg, transparent 0%, transparent 65%, rgba(167,139,250,0.7) 73%, rgba(200,180,255,0.9) 77%, rgba(255,255,255,1) 80%, rgba(200,180,255,0.9) 83%, rgba(167,139,250,0.7) 87%, transparent 95%, transparent 100%)",
          }}
        />
        {/* Content container — sits on top, inset by 1px, hides the gradient center */}
        <div className="relative h-full rounded-2xl overflow-hidden z-10">
          {/* Background gradient */}
          <div className="absolute inset-0 z-0 pointer-events-none">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `
                  radial-gradient(ellipse 90% 70% at 10% 0%, hsl(263, 70%, 22%) 0%, transparent 50%),
                  radial-gradient(ellipse 80% 60% at 90% 85%, hsl(240, 60%, 18%) 0%, transparent 45%),
                  radial-gradient(ellipse 60% 50% at 65% 25%, hsl(280, 55%, 16%) 0%, transparent 45%),
                  radial-gradient(ellipse 50% 40% at 30% 70%, hsl(250, 50%, 14%) 0%, transparent 45%),
                  radial-gradient(ellipse 100% 80% at 50% 50%, hsl(230, 60%, 10%) 0%, transparent 75%),
                  linear-gradient(160deg,
                    hsl(224, 71%, 6%) 0%,
                    hsl(235, 65%, 12%) 20%,
                    hsl(255, 60%, 16%) 40%,
                    hsl(270, 55%, 13%) 60%,
                    hsl(240, 60%, 10%) 80%,
                    hsl(224, 71%, 6%) 100%)`,
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] via-transparent to-white/[0.01]" />
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}

// ─── Copilot Input ───────────────────────────────────────────────────────────

function CopilotInput({
  text,
  showCursor,
}: {
  text: string;
  showCursor: boolean;
}) {
  return (
    <div className="flex items-center gap-2 bg-white/5 border border-violet-500/30 rounded-xl px-4 py-2.5 backdrop-blur-sm shadow-lg shadow-violet-500/5 flex-1 min-w-0">
      <Sparkles className="w-4 h-4 text-violet-400 flex-shrink-0" />
      <div className="flex-1 text-white/80 text-sm font-mono min-h-[20px] flex items-center min-w-0 truncate">
        <span className="truncate">{text}</span>
        {showCursor && (
          <motion.span
            className="inline-block w-[2px] h-4 bg-violet-400 ml-[1px] flex-shrink-0"
            animate={{ opacity: [1, 0, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
        )}
      </div>
      <span className="text-violet-400/50 text-xs flex-shrink-0 hidden sm:inline">
        AI Copilot
      </span>
    </div>
  );
}

// ─── Animation Phases ────────────────────────────────────────────────────────

// ─── Main Demo Page ──────────────────────────────────────────────────────────

export default function ScriptEditorDemo() {
  const [visibleCount, setVisibleCount] = useState(0);
  const [elements, setElements] = useState<StoryElement[]>([]);
  const [copilotText, setCopilotText] = useState("");
  const [showCursor, setShowCursor] = useState(true);
  const [highlightMusic, setHighlightMusic] = useState(false);
  const [musicMorphPhase, setMusicMorphPhase] = useState<
    "loading" | "revealing" | null
  >(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOffset, setDragOffset] = useState(0);
  const [globalVisible, setGlobalVisible] = useState(true);
  const [cycle, setCycle] = useState(0);
  const timeoutsRef = useRef<NodeJS.Timeout[]>([]);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const elementRefsMap = useRef<Map<string, HTMLDivElement>>(new Map());

  const clearTimeouts = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
  }, []);

  const schedule = useCallback((fn: () => void, delay: number) => {
    const id = setTimeout(fn, delay);
    timeoutsRef.current.push(id);
    return id;
  }, []);

  const typeText = useCallback(
    (text: string, startDelay: number, onDone?: () => void) => {
      const speed = 35;
      for (let i = 0; i <= text.length; i++) {
        schedule(
          () => setCopilotText(text.slice(0, i)),
          startDelay + i * speed,
        );
      }
      if (onDone) {
        schedule(onDone, startDelay + text.length * speed + 200);
      }
    },
    [schedule],
  );

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      const container = scrollContainerRef.current;
      if (container) {
        container.scrollTo({
          top: container.scrollHeight,
          behavior: "smooth",
        });
      }
    });
  }, []);

  const resetState = useCallback(() => {
    setVisibleCount(0);
    setElements([]);
    setCopilotText("");
    setShowCursor(true);
    setHighlightMusic(false);
    setMusicMorphPhase(null);
    setDragIndex(null);
    setDragOffset(0);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, []);

  // Main animation orchestrator
  useEffect(() => {
    clearTimeouts();
    resetState();
    setGlobalVisible(true);

    let t = 0;

    // Phase 1: Prompt typing (0-4s)
    typeText(PROMPT_1, t + 300, () => {
      setShowCursor(true);
    });
    t += 4000;

    // Phase 2: Elements appear (4-12s)
    schedule(() => {
      setElements(INITIAL_ELEMENTS);
      setCopilotText(PROMPT_1);
    }, t);

    for (let i = 0; i < INITIAL_ELEMENTS.length; i++) {
      schedule(
        () => {
          setVisibleCount(i + 1);
          scrollToBottom();
        },
        t + 400 + i * 1000,
      );
    }
    t += 400 + INITIAL_ELEMENTS.length * 1000 + 500;

    // Phase 3: AI edit prompt
    schedule(() => {
      setCopilotText("");
    }, t);
    typeText(PROMPT_2, t + 300, () => {
      // Scroll to top first so music-1 is visible before editing
      schedule(() => {
        scrollContainerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
      }, 200);

      // Start loading shimmer on music element
      schedule(() => {
        setHighlightMusic(true);
        setMusicMorphPhase("loading");
      }, 600);

      // After loading, swap text + attributes and start word-by-word reveal
      schedule(() => {
        setElements((prev) =>
          prev.map((el) =>
            el.id === "music-1"
              ? {
                  ...el,
                  text: EDITED_MUSIC_TEXT,
                  attributes: { mood: "Epic", genre: "Orchestral" },
                  model: "Udio",
                }
              : el,
          ),
        );
        setMusicMorphPhase("revealing");
      }, 1600);

      // Finish reveal
      const revealDuration = EDITED_MUSIC_TEXT.split(" ").length * 80 + 300;
      schedule(() => {
        setMusicMorphPhase(null);
      }, 1600 + revealDuration);

      schedule(
        () => {
          setElements((prev) => [...prev, RIVAL_CHARACTER]);
          setVisibleCount((c) => c + 1);
          scrollToBottom();
        },
        1600 + revealDuration + 400,
      );

      schedule(
        () => {
          setElements((prev) => [...prev, POST_RIVAL_NARRATION]);
          setVisibleCount((c) => c + 1);
          scrollToBottom();
        },
        1600 + revealDuration + 1200,
      );

      schedule(
        () => {
          setElements((prev) => [...prev, POST_RIVAL_CHARACTER]);
          setVisibleCount((c) => c + 1);
          scrollToBottom();
        },
        1600 + revealDuration + 2000,
      );

      schedule(() => setHighlightMusic(false), 1600 + revealDuration + 2800);
    });
    t += 8000;

    // Phase 4: Drag reorder
    schedule(() => {
      setDragIndex(3);
      scrollContainerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    }, t);

    schedule(() => setDragOffset(-140), t + 500);

    schedule(() => {
      setElements((prev) => {
        const newArr = [...prev];
        const item = newArr.splice(3, 1)[0];
        newArr.splice(1, 0, item);
        return newArr;
      });
      setDragIndex(null);
      setDragOffset(0);
    }, t + 2000);
    t += 3500;

    // Phase 5: Another AI edit
    schedule(() => {
      setCopilotText("");
    }, t);

    typeText(PROMPT_3, t + 300, () => {
      schedule(() => {
        PHASE5_ELEMENTS.forEach((el, i) => {
          schedule(() => {
            setElements((prev) => [...prev, el]);
            setVisibleCount((c) => c + 1);
            scrollToBottom();
          }, i * 800);
        });
      }, 500);
    });
    t += 6000;

    // Phase 6: Pause then fade out and loop
    schedule(() => {
      setGlobalVisible(false);
    }, t + 1500);

    schedule(() => {
      resetState();
      setCycle((c) => c + 1);
    }, t + 3000);

    return clearTimeouts;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cycle]);

  const visibleElements = elements.slice(0, visibleCount);

  return (
    <div className="relative h-full overflow-hidden">
      <AnimatedBorder>
        <motion.div
          ref={scrollContainerRef}
          className="relative z-[1] h-full overflow-y-auto scrollbar-hide"
          animate={{ opacity: globalVisible ? 1 : 0 }}
          transition={{ duration: 1 }}
        >
          {/* Top bar: Settings + Copilot + Generate — sticky */}
          <div className="sticky top-0 flex items-center gap-3 px-4 sm:px-6 pt-4 pb-3 z-20 bg-black/40 backdrop-blur-md shadow-[0_1px_3px_rgba(0,0,0,0.3),0_4px_12px_rgba(0,0,0,0.2)] rounded-2xl">
            <button
              aria-label="Settings"
              className="flex items-center gap-1.5 text-white/60 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all text-sm bg-white/5 px-2.5 py-2 rounded-lg border border-white/10 flex-shrink-0"
            >
              <Settings className="w-4 h-4" aria-hidden="true" />
              <span className="hidden sm:inline">Settings</span>
            </button>

            <CopilotInput text={copilotText} showCursor={showCursor} />

            <button
              aria-label="Generate"
              className="flex items-center gap-1.5 text-white bg-violet-600 hover:bg-violet-500 hover:shadow-[0_0_20px_rgba(124,58,237,0.5)] transition-all text-sm px-3 py-2 rounded-lg font-medium shadow-lg shadow-violet-500/20 flex-shrink-0"
            >
              <Play className="w-4 h-4 fill-white" aria-hidden="true" />
              <span className="hidden sm:inline">Generate</span>
            </button>
          </div>

          {/* Main content: row-based layout */}
          <div className="px-4 sm:px-6 pb-8">
            <div className="max-w-5xl mx-auto space-y-2">
              <AnimatePresence mode="popLayout">
                {visibleElements.map((el, index) => {
                  const isDragged = dragIndex === index;
                  return (
                    <motion.div
                      key={el.id}
                      layout
                      className="flex items-stretch"
                      ref={(node: HTMLDivElement | null) => {
                        if (node) {
                          elementRefsMap.current.set(el.id, node);
                        } else {
                          elementRefsMap.current.delete(el.id);
                        }
                      }}
                      initial={{ opacity: 0, y: 16, filter: "blur(4px)" }}
                      animate={{
                        opacity: isDragged ? 0.9 : 1,
                        y: isDragged ? dragOffset : 0,
                        scale: isDragged ? 1.02 : 1,
                        rotate: isDragged ? 0.5 : 0,
                        filter: "blur(0px)",
                        zIndex: isDragged ? 50 : 1,
                      }}
                      exit={{ opacity: 0, y: -8, filter: "blur(4px)" }}
                      transition={{
                        layout: { duration: 0.4, ease: "easeInOut" },
                        opacity: { duration: 0.5 },
                        y: { duration: 0.6, ease: "easeInOut" },
                        filter: { duration: 0.5 },
                        default: { duration: 0.5, ease: "easeOut" },
                      }}
                    >
                      {/* Left: Element card */}
                      <div className="w-[55%] sm:w-1/2 flex-shrink-0 flex justify-end pr-3 sm:pr-4">
                        <div className="w-full max-w-md flex flex-col">
                          <ElementCard
                            element={el}
                            highlighted={highlightMusic && el.id === "music-1"}
                            isDragging={isDragged}
                            textMorph={
                              el.id === "music-1" ? musicMorphPhase : null
                            }
                          />
                        </div>
                      </div>

                      {/* Center divider */}
                      <div className="relative flex-shrink-0 w-px self-stretch">
                        <div
                          className="absolute inset-0 w-px"
                          style={{
                            background: "rgba(255,255,255,0.15)",
                            boxShadow:
                              "0 0 6px 1px rgba(255,255,255,0.05), 0 0 16px 2px rgba(167,139,250,0.03)",
                          }}
                        />
                      </div>

                      {/* Right: Output preview */}
                      <div className="w-[45%] sm:w-1/2 flex-shrink-0 pl-3 sm:pl-4 flex items-center">
                        <div className="w-full max-w-md">
                          <div className="bg-white/[0.03] rounded-xl p-3 border border-white/[0.06] backdrop-blur-sm">
                            <OutputPreview element={el} />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </AnimatedBorder>
    </div>
  );
}
