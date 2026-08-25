import {
  Clapperboard,
  ImageIcon,
  Music,
  User,
  Volume2,
  Waves,
  type LucideIcon,
} from "lucide-react";

export type ElementType =
  | "music"
  | "image"
  | "clip"
  | "narration"
  | "sound"
  | "character";

export type DemoElement = {
  id: string;
  sceneId: string;
  type: ElementType;
  model: string;
  text: string;
  /** Seconds — sets the width of this element's timeline clip. */
  duration: number;
  /** Video source for image/clip elements. */
  media?: string;
  /** object-position for the 9:16 player crop, when centre cuts the subject. */
  focus?: string;
  avatar?: string;
  name?: string;
};

export const ELEMENT_LABELS: Record<ElementType, string> = {
  music: "Music",
  image: "Animated image",
  clip: "Clip",
  narration: "Narration",
  sound: "Sound effect",
  character: "Character",
};

export const ELEMENT_ICONS: Record<ElementType, LucideIcon> = {
  music: Music,
  image: ImageIcon,
  clip: Clapperboard,
  narration: Volume2,
  sound: Waves,
  character: User,
};

/** Media-type tints, mirroring the editor's dark-theme palette. */
export const ELEMENT_TINTS: Record<ElementType, string> = {
  music: "text-media-music",
  image: "text-media-image",
  clip: "text-media-clip",
  narration: "text-media-narration",
  sound: "text-media-sound",
  character: "text-media-character",
};

export const VISUAL_TYPES: ElementType[] = ["image", "clip"];

export const SCENES = [
  { id: "s1", name: "Scene 1" },
  { id: "s2", name: "Scene 2" },
  { id: "s3", name: "Scene 3" },
];

export const ELEMENTS: DemoElement[] = [
  {
    id: "music-1",
    sceneId: "s1",
    type: "music",
    model: "Slop Music v1",
    text: "Intense japanese drum beats with electronic synth bass",
    duration: 12,
  },
  {
    id: "image-1",
    sceneId: "s1",
    type: "image",
    model: "Slop Video v1",
    text: "A neon-lit tokyo street after rain. Signage in every colour reflects off the asphalt, and the road runs empty toward the overpass.",
    duration: 6,
    media: "/demo/images/tokyo-street.mp4",
  },
  {
    id: "narration-1",
    sceneId: "s1",
    type: "narration",
    model: "Slop Voice v1",
    text: "The engine caught on the second turn.",
    duration: 6,
  },
  {
    id: "character-1",
    sceneId: "s2",
    type: "character",
    model: "Slop Voice v1",
    name: "Takeshi",
    text: "Tonight we settle this. No rules, no limits.",
    duration: 5,
    avatar: "/demo/avatars/takeshi.webp",
  },
  {
    id: "clip-1",
    sceneId: "s2",
    type: "clip",
    model: "Slop Video v1",
    text: "POV from inside the car, city lights streaking past the windshield as the wipers cut through the rain.",
    duration: 9,
    media: "/demo/videos/city-drive.mp4",
  },
  {
    id: "character-2",
    sceneId: "s2",
    type: "character",
    model: "Slop Voice v1",
    name: "Ryu",
    text: "You think you can beat me? I own these streets.",
    duration: 5,
    avatar: "/demo/avatars/ryu.webp",
  },
  {
    id: "sound-1",
    sceneId: "s3",
    type: "sound",
    model: "Slop SFX v1",
    text: "Tyre screech on wet asphalt",
    duration: 2,
  },
  {
    id: "narration-2",
    sceneId: "s3",
    type: "narration",
    model: "Slop Voice v1",
    text: "The rear wheels broke loose as he pulled the handbrake.",
    duration: 5,
  },
  {
    id: "image-2",
    sceneId: "s3",
    type: "image",
    model: "Slop Video v1",
    text: "The silvia sideways through a tight corner, spray lit magenta by the arcade signage, sparks off the guard rail.",
    duration: 6,
    media: "/demo/images/drift-corner.mp4",
  },
  {
    id: "clip-2",
    sceneId: "s3",
    type: "clip",
    model: "Slop Video v1",
    text: "Slow motion on the drift, smoke billowing off the rear tyres as the car swings back into line.",
    duration: 7,
    media: "/demo/videos/drift-smoke.mp4",
  },
];

export const ELEMENTS_BY_ID = new Map(ELEMENTS.map((el) => [el.id, el]));

const OPENING = ["music-1", "image-1", "narration-1", "character-1", "clip-1"];

const EDITED_MUSIC =
  "Epic orchestral with aggressive taiko drums and a screeching electric guitar";

export type Step =
  | { at: number; do: "type"; text: string }
  | { at: number; do: "send"; text: string }
  | { at: number; do: "think" }
  | { at: number; do: "tool"; type: ElementType; label: string }
  | { at: number; do: "edit"; id: string; text: string; model: string }
  | { at: number; do: "reveal"; id: string }
  | { at: number; do: "add"; id: string; generating?: boolean }
  | { at: number; do: "resolve"; id: string }
  | { at: number; do: "reply"; lines: string[]; seconds: number }
  | { at: number; do: "grab"; id: string }
  | { at: number; do: "drop"; id: string; by: number }
  | { at: number; do: "play" }
  | { at: number; do: "restart" };

/**
 * The demo loop, authored as absolute timings. Two prompts to the copilot,
 * a drag reorder, then playback.
 */
const PROMPT_1 = "make the music more dramatic and add a rival";
const PROMPT_2 = "add a drift scene with tyre screech";

export const STEPS: Step[] = [
  { at: 1200, do: "type", text: PROMPT_1 },
  { at: 4400, do: "send", text: PROMPT_1 },
  { at: 4800, do: "think" },
  { at: 5600, do: "tool", type: "music", label: "Rewrote the music prompt" },
  {
    at: 5900,
    do: "edit",
    id: "music-1",
    text: EDITED_MUSIC,
    model: "Slop Music v2",
  },
  { at: 7100, do: "reveal", id: "music-1" },
  { at: 8600, do: "tool", type: "character", label: "Added Ryu · character" },
  { at: 8900, do: "add", id: "character-2" },
  {
    at: 10000,
    do: "reply",
    seconds: 22,
    lines: [
      "done. the music is orchestral now — taiko under a screeching guitar line.",
      "ryu's in scene 2 with one line. she reads menacing, which is what you wanted.",
    ],
  },
  { at: 13000, do: "type", text: PROMPT_2 },
  { at: 15800, do: "send", text: PROMPT_2 },
  { at: 16200, do: "think" },
  { at: 17000, do: "tool", type: "sound", label: "Added tyre screech · SFX" },
  { at: 17300, do: "add", id: "sound-1" },
  { at: 18200, do: "tool", type: "narration", label: "Added narration" },
  { at: 18500, do: "add", id: "narration-2" },
  { at: 19400, do: "tool", type: "image", label: "Generated animated image" },
  { at: 19700, do: "add", id: "image-2", generating: true },
  { at: 21800, do: "resolve", id: "image-2" },
  { at: 22600, do: "tool", type: "clip", label: "Generated slow-mo clip" },
  { at: 22900, do: "add", id: "clip-2", generating: true },
  { at: 25000, do: "resolve", id: "clip-2" },
  {
    at: 25800,
    do: "reply",
    seconds: 34,
    lines: [
      "scene 3 is in — the screech, the handbrake beat, the drift shot and a slow-mo clip to land it.",
      "three new clips on the timeline. drag them around if the pacing feels off.",
    ],
  },
  { at: 29500, do: "grab", id: "sound-1" },
  { at: 30700, do: "drop", id: "sound-1", by: 1 },
  { at: 31500, do: "play" },
  { at: 44000, do: "restart" },
];

export const PLAYBACK_MS = 12000;

/** Tick intervals the ruler picks from, as the editor's timeline does. */
export const TICK_STEPS = [1, 2, 5, 10, 15, 30, 60];

export const formatClock = (seconds: number) =>
  `${Math.floor(seconds / 60)}:${String(Math.round(seconds) % 60).padStart(2, "0")}`;

/** Conversation already on screen when the loop starts. */
export const OPENING_TURNS = [
  { kind: "user" as const, text: "a tokyo street race short, 45 seconds" },
  {
    kind: "reply" as const,
    seconds: 12,
    lines: [
      "on it. drafted two scenes — the neon street establish, then takeshi in the car.",
      "music and narration are in. want me to punch it up?",
    ],
  },
];

export const OPENING_IDS = OPENING;
