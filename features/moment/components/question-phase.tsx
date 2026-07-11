"use client";

import { motion } from "framer-motion";
import { useState } from "react";

import { cn } from "@/lib/utils";

import { themeTokens } from "../lib/themes";
import type { MomentQuestion, MomentTheme } from "../types";

/**
 * The pivot. The question alone on screen. "Yes" grows with every hesitation;
 * "No" — when the creator left it playful — sweetly slips away and pleads,
 * never mean, never quite catchable. With playful-no disabled it's an honest
 * button that records a real "no".
 */

// Sweet escalation as the "No" keeps dodging. Tasteful, a little pleading.
const PLEAS = [
  "Are you sure?",
  "Really?",
  "Please? 🥺",
  "Think again…",
  "Pretty please?",
  "My heart 💔",
  "You can't catch me",
];

export function QuestionPhase({
  theme,
  question,
  onAnswer,
}: {
  theme: MomentTheme;
  question: MomentQuestion;
  onAnswer: (answer: "yes" | "no") => void;
}) {
  const t = themeTokens(theme);
  const [dodges, setDodges] = useState(0);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const yesScale = Math.min(1 + dodges * 0.12, 1.9);
  const noLabel = dodges === 0 ? question.noLabel : PLEAS[(dodges - 1) % PLEAS.length];

  function evade() {
    // Jump somewhere new within a comfortable box around centre.
    setOffset({
      x: (Math.random() - 0.5) * 320,
      y: (Math.random() - 0.5) * 240,
    });
    setDodges((d) => d + 1);
  }

  return (
    <div className="flex max-w-xl flex-col items-center gap-12 px-8 text-center">
      <motion.h1
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.9, ease: "easeOut" }}
        className={cn("text-4xl leading-tight sm:text-5xl", t.headlineFont, t.text)}
      >
        {question.text}
      </motion.h1>

      <div className="relative flex min-h-32 items-center justify-center gap-5">
        <motion.button
          type="button"
          onClick={() => onAnswer("yes")}
          animate={{ scale: yesScale }}
          transition={{ type: "spring", stiffness: 220, damping: 16 }}
          whileTap={{ scale: yesScale * 0.94 }}
          className={cn(
            "rounded-full px-8 py-3 text-lg font-semibold shadow-lg",
            t.accentBg,
            t.accentText,
          )}
        >
          {question.yesLabel}
        </motion.button>

        <motion.button
          type="button"
          // Playful: evade on approach AND on click — it's never caught.
          onMouseEnter={question.playfulNo ? evade : undefined}
          onClick={question.playfulNo ? evade : () => onAnswer("no")}
          animate={{
            x: offset.x,
            y: offset.y,
            scale: question.playfulNo ? Math.max(1 - dodges * 0.05, 0.65) : 1,
          }}
          transition={{ type: "spring", stiffness: 300, damping: 18 }}
          className={cn(
            "rounded-full border px-7 py-3 text-lg backdrop-blur-sm",
            t.accentBorder,
            t.muted,
          )}
          style={{ background: `rgb(${t.particle} / 0.06)` }}
        >
          {noLabel}
        </motion.button>
      </div>

      {dodges > 2 && question.playfulNo && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={cn("text-sm italic", t.muted)}
        >
          (there&apos;s really only one answer here)
        </motion.p>
      )}
    </div>
  );
}
