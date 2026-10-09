"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useState } from "react";

import { FLAMES_CONFIG, type FlamesConfig } from "@/features/flames/config";
import {
  type FlamesOutcome,
  resolveFlames,
} from "@/features/flames/lib/engine";
import { cn } from "@/lib/utils";

type Props = {
  config?: FlamesConfig;
  className?: string;
};

export function FlamesExperience({ config = FLAMES_CONFIG, className }: Props) {
  const reduce = useReducedMotion();
  const [nameA, setNameA] = useState(config.nameA);
  const [nameB, setNameB] = useState(config.nameB);
  const [phase, setPhase] = useState<"input" | "striking" | "result">("input");
  const [outcome, setOutcome] = useState<FlamesOutcome | null>(null);
  const [strikeIdx, setStrikeIdx] = useState(-1);

  function play() {
    if (!nameA.trim() || !nameB.trim()) return;
    const result = resolveFlames(nameA, nameB);
    setOutcome(result);
    if (reduce) {
      setPhase("result");
      return;
    }
    setPhase("striking");
    setStrikeIdx(0);
    let i = 0;
    const id = window.setInterval(() => {
      i += 1;
      setStrikeIdx(i);
      if (i >= 6) {
        window.clearInterval(id);
        window.setTimeout(() => setPhase("result"), 280);
      }
    }, 220);
  }

  function reset() {
    setPhase("input");
    setOutcome(null);
    setStrikeIdx(-1);
  }

  return (
    <div
      className={cn(
        "relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-[#fdf3ec] px-5 py-12",
        className,
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 50% 20%, #ffe0cc 0%, transparent 60%), radial-gradient(ellipse 50% 40% at 80% 80%, #f8c4b0 0%, transparent 55%)",
        }}
      />

      <div className="relative z-10 w-full max-w-md">
        <p className="text-center text-xs font-semibold tracking-[0.2em] text-[#c75b39] uppercase">
          Play together
        </p>
        <h1 className="mt-2 text-center font-display text-4xl text-[#3a2a25] md:text-5xl">
          {config.title.trim() || "FLAMES"}
        </h1>
        {config.intro && (
          <p className="mt-3 text-center text-sm leading-relaxed text-[#7a6258]">
            {config.intro}
          </p>
        )}

        <AnimatePresence mode="wait">
          {phase === "input" && (
            <motion.div
              key="input"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="mt-8 space-y-3"
            >
              <input
                className={fieldCls}
                value={nameA}
                onChange={(e) => setNameA(e.target.value)}
                placeholder="Their name"
                maxLength={80}
              />
              <input
                className={fieldCls}
                value={nameB}
                onChange={(e) => setNameB(e.target.value)}
                placeholder="Your name"
                maxLength={80}
              />
              <button
                type="button"
                onClick={play}
                disabled={!nameA.trim() || !nameB.trim()}
                className="mt-2 flex h-12 w-full items-center justify-center rounded-full bg-gradient-to-r from-[#ff7a59] to-[#f2596f] text-sm font-semibold text-white shadow-lg shadow-[#f2596f]/25 transition-transform hover:-translate-y-0.5 disabled:opacity-40"
              >
                Strike the letters
              </button>
            </motion.div>
          )}

          {phase === "striking" && (
            <motion.div
              key="strike"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mt-10 flex flex-wrap justify-center gap-2"
            >
              {["F", "L", "A", "M", "E", "S"].map((letter, i) => (
                <span
                  key={letter}
                  className={cn(
                    "grid size-12 place-items-center rounded-xl border font-display text-lg transition-all",
                    i < strikeIdx
                      ? "scale-90 border-transparent bg-[#3a2a25]/10 text-[#3a2a25]/30 line-through"
                      : "border-[#f2dace] bg-white text-[#c75b39]",
                  )}
                >
                  {letter}
                </span>
              ))}
            </motion.div>
          )}

          {phase === "result" && outcome && (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-8 rounded-3xl border border-[#f2dace] bg-white/90 p-8 text-center shadow-[0_24px_60px_-28px_rgba(199,91,57,0.45)] backdrop-blur"
            >
              <p className="text-xs font-semibold tracking-[0.18em] text-[#92786c] uppercase">
                Destiny says
              </p>
              <p className="mt-3 font-display text-4xl text-[#c75b39]">
                {outcome}
              </p>
              <p className="mt-2 text-sm text-[#7a6258]">
                {nameA.trim()} × {nameB.trim()}
              </p>
              {config.note.trim() && (
                <p className="mt-5 font-hand text-lg leading-relaxed text-[#3a2a25]">
                  {config.note}
                </p>
              )}
              <button
                type="button"
                onClick={reset}
                className="mt-6 text-sm font-medium text-[#c75b39] underline-offset-4 hover:underline"
              >
                Try again
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

const fieldCls =
  "h-12 w-full rounded-2xl border border-[#e3d2c5] bg-white px-4 text-sm text-[#3a2a25] outline-none focus:border-[#ff7a59] focus:ring-2 focus:ring-[#ff7a59]/20";
