"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";

const words = [
  "youtube videos",
  "crime stories",
  "creepypastas",
  "explainer videos",
  "sleep stories",
  "audiobooks",
  "history videos",
  "podcasts",
  "YT shorts",
  "bedtime stories",
  "IG reels",
  "newscasts",
  "kids animations",
  "voiceovers",
  "TikToks",
];

type Phase = "holding" | "erasing" | "pausing" | "typing";

export default function AnimatedTagline() {
  const wordIndexRef = useRef(0);
  const [currentWord, setCurrentWord] = useState(words[0]);
  const [displayedChars, setDisplayedChars] = useState(words[0].length);
  const [phase, setPhase] = useState<Phase>("holding");

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    switch (phase) {
      case "holding":
        timeout = setTimeout(() => setPhase("erasing"), 2500);
        break;

      case "erasing":
        if (displayedChars > 0) {
          timeout = setTimeout(() => setDisplayedChars((c) => c - 1), 80);
        } else {
          setPhase("pausing");
        }
        break;

      case "pausing":
        timeout = setTimeout(() => {
          wordIndexRef.current = (wordIndexRef.current + 1) % words.length;
          setCurrentWord(words[wordIndexRef.current]);
          setPhase("typing");
        }, 200);
        break;

      case "typing":
        if (displayedChars < currentWord.length) {
          timeout = setTimeout(() => setDisplayedChars((c) => c + 1), 100);
        } else {
          setPhase("holding");
        }
        break;
    }

    return () => clearTimeout(timeout);
  }, [phase, displayedChars, currentWord]);

  const visibleText = currentWord.slice(0, displayedChars);

  return (
    <h1
      className="text-6xl lg:text-7xl text-white"
      style={{
        fontFamily: "var(--font-instrument-serif), serif",
        letterSpacing: "-0.02em",
        lineHeight: "1.2em",
      }}
    >
      AI{" "}
      <span className="relative">
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-cyan-400 italic pr-1">
          {visibleText}
        </span>
        <motion.span
          className="inline-block w-[3px] h-[0.9em] bg-gradient-to-b from-violet-400 to-cyan-400 align-middle ml-0.5 rounded-full"
          animate={{ opacity: [1, 0] }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            repeatType: "reverse",
          }}
        />
      </span>
      <br />
      that don&apos;t insult
      <br />
      your audience
    </h1>
  );
}
