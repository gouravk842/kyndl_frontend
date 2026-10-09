"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";

import { applyThisOrThat } from "@/features/activity-bank/demo-content";
import { DemoGate } from "@/features/activity-bank/demo-gate";
import {
  THIS_OR_THAT_CONFIG,
  type ThisOrThatConfig,
} from "@/features/this-or-that/config";
import { cn } from "@/lib/utils";

type Props = {
  config?: ThisOrThatConfig;
  className?: string;
};

export function ThisOrThatExperience(props: Props) {
  return (
    <DemoGate
      authored={props.config}
      fallback={THIS_OR_THAT_CONFIG}
      includeAdult={false}
      apply={applyThisOrThat}
    >
      {(config) => <ThisOrThatPlay {...props} config={config} />}
    </DemoGate>
  );
}

function ThisOrThatPlay({
  config,
  className,
}: Props & { config: ThisOrThatConfig }) {
  const pairs = config.pairs.length ? config.pairs : THIS_OR_THAT_CONFIG.pairs;
  const [idx, setIdx] = useState(0);
  const [leftWins, setLeftWins] = useState(0);
  const [rightWins, setRightWins] = useState(0);
  const [done, setDone] = useState(false);

  const pair = pairs[idx];
  const majorityLeft = leftWins >= rightWins;

  const typeLabel = useMemo(() => {
    if (leftWins === rightWins) return "Perfectly split chaos";
    return majorityLeft ? "Team Left energy" : "Team Right energy";
  }, [leftWins, rightWins, majorityLeft]);

  function pick(side: "left" | "right") {
    const nextLeft = leftWins + (side === "left" ? 1 : 0);
    const nextRight = rightWins + (side === "right" ? 1 : 0);
    if (idx + 1 >= pairs.length) {
      setLeftWins(nextLeft);
      setRightWins(nextRight);
      setDone(true);
      return;
    }
    setLeftWins(nextLeft);
    setRightWins(nextRight);
    setIdx(idx + 1);
  }

  function reset() {
    setIdx(0);
    setLeftWins(0);
    setRightWins(0);
    setDone(false);
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
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(135deg, #ffe8dc 0%, transparent 40%), linear-gradient(225deg, #f5d0c8 0%, transparent 45%)",
        }}
      />

      <div className="relative z-10 w-full max-w-lg">
        <p className="text-center text-xs font-semibold tracking-[0.2em] text-[#c75b39] uppercase">
          Tap fast
        </p>
        <h1 className="mt-2 text-center font-display text-4xl text-[#3a2a25]">
          {config.title.trim() || "This or That"}
        </h1>
        {config.intro && !done && (
          <p className="mt-3 text-center text-sm text-[#7a6258]">
            {config.intro}
          </p>
        )}

        <AnimatePresence mode="wait">
          {!done && pair && (
            <motion.div
              key={pair.id}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              className="mt-8"
            >
              <p className="mb-4 text-center text-xs text-[#92786c]">
                {idx + 1} / {pairs.length}
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => pick("left")}
                  className="min-h-28 rounded-3xl border border-[#f2dace] bg-white p-6 text-center font-display text-2xl text-[#3a2a25] shadow-sm transition-transform hover:-translate-y-1 hover:border-[#ff7a59]"
                >
                  {pair.left}
                </button>
                <button
                  type="button"
                  onClick={() => pick("right")}
                  className="min-h-28 rounded-3xl border border-[#f2dace] bg-white p-6 text-center font-display text-2xl text-[#3a2a25] shadow-sm transition-transform hover:-translate-y-1 hover:border-[#f2596f]"
                >
                  {pair.right}
                </button>
              </div>
            </motion.div>
          )}

          {done && (
            <motion.div
              key="done"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-8 rounded-3xl border border-[#f2dace] bg-white/95 p-8 text-center shadow-[0_24px_60px_-28px_rgba(199,91,57,0.4)]"
            >
              <p className="text-xs font-semibold tracking-[0.16em] text-[#92786c] uppercase">
                Your type card
              </p>
              <p className="mt-3 font-display text-3xl text-[#c75b39]">
                {typeLabel}
              </p>
              <p className="mt-3 text-sm text-[#7a6258]">
                {leftWins} left · {rightWins} right
              </p>
              {config.resultBlurb.trim() && (
                <p className="mt-5 text-sm leading-relaxed text-[#3a2a25]">
                  {config.resultBlurb}
                </p>
              )}
              <button
                type="button"
                onClick={reset}
                className="mt-6 text-sm font-medium text-[#c75b39] underline-offset-4 hover:underline"
              >
                Play again
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
