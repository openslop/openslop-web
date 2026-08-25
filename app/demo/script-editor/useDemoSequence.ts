"use client";

import { useEffect, useReducer } from "react";
import {
  ELEMENTS_BY_ID,
  OPENING_IDS,
  PLAYBACK_MS,
  STEPS,
  VISUAL_TYPES,
  type ElementType,
  type Step,
} from "./script";

export type Turn =
  | { kind: "user"; text: string }
  | { kind: "tool"; type: ElementType; label: string }
  | { kind: "reply"; lines: string[]; seconds: number };

type State = {
  composer: string;
  turns: Turn[];
  thinking: boolean;
  visible: string[];
  edits: Record<string, { text: string; model: string }>;
  morphing: string | null;
  revealing: string | null;
  generating: string[];
  dragging: string | null;
  playing: boolean;
  focus: string | null;
  /** Advances while playing, cutting the preview between visual elements. */
  beat: number;
};

type Action =
  | Exclude<Step, { do: "type" } | { do: "restart" }>
  | { do: "typed"; text: string }
  | { do: "beat" }
  | { do: "reset" };

const INITIAL: State = {
  composer: "",
  turns: [],
  thinking: false,
  visible: OPENING_IDS,
  edits: {},
  morphing: null,
  revealing: null,
  generating: [],
  dragging: null,
  playing: false,
  focus: "image-1",
  beat: 0,
};

const move = (ids: string[], id: string, by: number) => {
  const from = ids.indexOf(id);
  if (from < 0) return ids;
  const next = ids.filter((x) => x !== id);
  next.splice(Math.max(from + by, 0), 0, id);
  return next;
};

function reducer(state: State, action: Action): State {
  switch (action.do) {
    case "reset":
      return INITIAL;
    case "typed":
      return { ...state, composer: action.text };
    case "beat":
      return { ...state, beat: state.beat + 1 };
    case "send":
      return {
        ...state,
        composer: "",
        turns: [...state.turns, { kind: "user", text: action.text }],
        thinking: false,
      };
    case "think":
      return { ...state, thinking: true };
    case "tool":
      return {
        ...state,
        turns: [
          ...state.turns,
          { kind: "tool", type: action.type, label: action.label },
        ],
      };
    case "reply":
      return {
        ...state,
        turns: [
          ...state.turns,
          { kind: "reply", lines: action.lines, seconds: action.seconds },
        ],
        thinking: false,
      };
    case "edit":
      return {
        ...state,
        morphing: action.id,
        edits: { ...state.edits, [action.id]: action },
      };
    case "reveal":
      return { ...state, morphing: null, revealing: action.id };
    case "add":
      return {
        ...state,
        revealing: null,
        visible: [...state.visible, action.id],
        generating: action.generating
          ? [...state.generating, action.id]
          : state.generating,
        focus: action.generating ? action.id : state.focus,
      };
    case "resolve":
      return {
        ...state,
        generating: state.generating.filter((id) => id !== action.id),
        focus: action.id,
      };
    case "grab":
      return { ...state, dragging: action.id };
    case "drop":
      return {
        ...state,
        dragging: null,
        visible: move(state.visible, action.id, action.by),
      };
    case "play":
      return { ...state, playing: true };
    default:
      return state;
  }
}

const TYPE_MS = 34;

export function useDemoSequence() {
  const [state, dispatch] = useReducer(reducer, INITIAL);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    const intervals: ReturnType<typeof setInterval>[] = [];

    const run = () => {
      timers.length = 0;
      intervals.forEach(clearInterval);
      intervals.length = 0;
      dispatch({ do: "reset" });
      for (const step of STEPS) {
        timers.push(
          setTimeout(() => {
            if (step.do === "restart") return run();
            if (step.do !== "type") return dispatch(step);

            let i = 0;
            const typer = setInterval(() => {
              i += 1;
              dispatch({ do: "typed", text: step.text.slice(0, i) });
              if (i >= step.text.length) clearInterval(typer);
            }, TYPE_MS);
            intervals.push(typer);
          }, step.at),
        );
      }
    };

    run();
    return () => {
      timers.forEach(clearTimeout);
      intervals.forEach(clearInterval);
    };
  }, []);

  const visuals = state.visible.filter((id) => {
    const type = ELEMENTS_BY_ID.get(id)?.type;
    return type ? VISUAL_TYPES.includes(type) : false;
  });

  useEffect(() => {
    if (!state.playing || visuals.length === 0) return;
    const id = setInterval(
      () => dispatch({ do: "beat" }),
      PLAYBACK_MS / visuals.length,
    );
    return () => clearInterval(id);
  }, [state.playing, visuals.length]);

  return {
    ...state,
    previewId: state.playing
      ? visuals[state.beat % visuals.length]
      : (state.focus ?? visuals.at(-1)),
  };
}
