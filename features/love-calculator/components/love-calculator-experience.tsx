"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";

import {
  LOVE_CALCULATOR_CONFIG,
  type LoveCalculatorConfig,
} from "@/features/love-calculator/config";
import { bandFor, lovePercent } from "@/features/love-calculator/lib/score";
import { cn } from "@/lib/utils";

type Props = {
  config?: LoveCalculatorConfig;
  className?: string;
};

export function LoveCalculatorExperience({
  config = LOVE_CALCULATOR_CONFIG,
  className,
}: Props) {
  const reduce = useReducedMotion();
  const [nameA, setNameA] = useState(config.nameA);
  const [nameB, setNameB] = useState(config.nameB);
  const [phase, setPhase] = useState<"input" | "meter" | "result">("input");
  const [pct, setPct] = useState(0);
  const [display, setDisplay] = useState(0);

  function play() {
    if (!nameA.trim() || !nameB.trim()) return;
    const score = lovePercent(nameA, nameB);
    setPct(score);
    setDisplay(0);
    setPhase(reduce ? "result" : "meter");
  }

  useEffect(() => {
    if (phase !== "meter") return;
    let frame = 0;
    const id = window.setInterval(() => {
      frame += 1;
      setDisplay(Math.min(pct, Math.round((frame / 28) * pct)));
      if (frame >= 28) {
        window.clearInterval(id);
        window.setTimeout(() => setPhase("result"), 200);
      }
    }, 30);
    return () => window.clearInterval(id);
  }, [phase, pct]);

  const band = bandFor(pct);
  const blurb = config.bands[band];

  return (
    <div
      className={cn(
        "relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-[#fff6f0] px-5 py-12",
        className,
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 45% at 30% 10%, #ffd4c4 0%, transparent 55%), radial-gradient(ellipse 50% 40% at 90% 70%, #f9c0d0 0%, transparent 50%)",
        }}
      />

      <div className="relative z-10 w-full max-w-md">
        <p className="text-center text-xs font-semibold tracking-[0.2em] text-[#c75b39] uppercase">
          Fake science · real feelings
        </p>
        <h1 className="mt-2 text-center font-display text-4xl text-[#3a2a25]">
          {config.title.trim() || "Love Calculator"}
        </h1>
        {config.intro && (
          <p className="mt-3 text-center text-sm text-[#7a6258]">
            {config.intro}
          </p>
        )}

        <AnimatePresence mode="wait">
          {phase === "input" && (
            <motion.div
              key="in"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-8 space-y-3"
            >
              <input
                className={fieldCls}
                value={nameA}
                onChange={(e) => setNameA(e.target.value)}
                placeholder="Name one"
                maxLength={80}
              />
              <input
                className={fieldCls}
                value={nameB}
                onChange={(e) => setNameB(e.target.value)}
                placeholder="Name two"
                maxLength={80}
              />
              <button
                type="button"
                onClick={play}
                disabled={!nameA.trim() || !nameB.trim()}
                className="flex h-12 w-full items-center justify-center rounded-full bg-gradient-to-r from-[#ff7a59] to-[#f2596f] text-sm font-semibold text-white disabled:opacity-40"
              >
                Calculate the vibes
              </button>
            </motion.div>
          )}

          {(phase === "meter" || phase === "result") && (
            <motion.div
              key="out"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-8 rounded-3xl border border-[#f2dace] bg-white/95 p-8 text-center shadow-[0_24px_60px_-28px_rgba(242,89,111,0.4)]"
            >
              <p className="font-display text-6xl text-[#f2596f]">
                {phase === "meter" ? display : pct}%
              </p>
              <p className="mt-2 text-sm text-[#7a6258]">
                {nameA.trim()} × {nameB.trim()}
              </p>
              <div className="mx-auto mt-5 h-3 w-full max-w-xs overflow-hidden rounded-full bg-[#fbeee6]">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-[#ff7a59] to-[#f2596f]"
                  initial={{ width: 0 }}
                  animate={{ width: `${phase === "meter" ? display : pct}%` }}
                  transition={{ duration: reduce ? 0 : 0.6 }}
                />
              </div>
              {phase === "result" && (
                <>
                  {blurb && (
                    <p className="mt-5 text-sm leading-relaxed text-[#3a2a25]">
                      {blurb}
                    </p>
                  )}
                  {config.note.trim() && (
                    <p className="mt-4 font-hand text-lg text-[#3a2a25]">
                      {config.note}
                    </p>
                  )}
                  <button
                    type="button"
                    onClick={() => setPhase("input")}
                    className="mt-6 text-sm font-medium text-[#c75b39] underline-offset-4 hover:underline"
                  >
                    Recalculate
                  </button>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

const fieldCls =
  "h-12 w-full rounded-2xl border border-[#e3d2c5] bg-white px-4 text-sm text-[#3a2a25] outline-none focus:border-[#ff7a59] focus:ring-2 focus:ring-[#ff7a59]/20";
