"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

import { applyDelulu } from "@/features/activity-bank/demo-content";
import { DemoGate } from "@/features/activity-bank/demo-gate";
import {
  DELULU_METER_CONFIG,
  type DeluluMeterConfig,
} from "@/features/delulu-meter/config";
import { bandKey, deluluScore } from "@/features/delulu-meter/lib/score";
import { cn } from "@/lib/utils";

type Props = {
  config?: DeluluMeterConfig;
  className?: string;
};

export function DeluluMeterExperience(props: Props) {
  return (
    <DemoGate
      authored={props.config}
      fallback={DELULU_METER_CONFIG}
      includeAdult={false}
      apply={applyDelulu}
    >
      {(config) => <DeluluMeterPlay {...props} config={config} />}
    </DemoGate>
  );
}

function DeluluMeterPlay({
  config,
  className,
}: Props & { config: DeluluMeterConfig }) {
  const questions = config.questions.length
    ? config.questions
    : DELULU_METER_CONFIG.questions;
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [done, setDone] = useState(false);

  const q = questions[idx];
  const score = deluluScore(questions, answers);
  const band = bandKey(score);

  function answer(value: number) {
    if (!q) return;
    const next = { ...answers, [q.id]: value };
    setAnswers(next);
    if (idx + 1 >= questions.length) {
      setDone(true);
      return;
    }
    setIdx(idx + 1);
  }

  function reset() {
    setIdx(0);
    setAnswers({});
    setDone(false);
  }

  return (
    <div
      className={cn(
        "relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-[#1a0f14] px-5 py-12 text-[#fff7f1]",
        className,
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-80"
        style={{
          background:
            "radial-gradient(ellipse 55% 40% at 50% 0%, #5c2038 0%, transparent 60%), radial-gradient(ellipse 40% 35% at 80% 80%, #3a1830 0%, transparent 50%)",
        }}
      />

      <div className="relative z-10 w-full max-w-md">
        <p className="text-center text-xs font-semibold tracking-[0.22em] text-[#f7a8b8] uppercase">
          Be honest · or don&apos;t
        </p>
        <h1 className="mt-2 text-center font-display text-4xl text-[#fff7f1]">
          {config.title.trim() || "Delulu Meter"}
        </h1>
        {config.intro && !done && (
          <p className="mt-3 text-center text-sm text-[#d4b4bc]">
            {config.intro}
          </p>
        )}

        <AnimatePresence mode="wait">
          {!done && q && (
            <motion.div
              key={q.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur"
            >
              <p className="text-xs text-[#d4b4bc]">
                {idx + 1} / {questions.length}
              </p>
              <p className="mt-3 font-display text-2xl leading-snug">
                {q.prompt}
              </p>
              <div className="mt-6 flex justify-between gap-2">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => answer(n)}
                    className="grid size-11 flex-1 place-items-center rounded-2xl border border-white/15 bg-white/5 text-sm font-semibold transition-colors hover:border-[#f2596f] hover:bg-[#f2596f]/20"
                    aria-label={`Rate ${n} of 5`}
                  >
                    {n}
                  </button>
                ))}
              </div>
              <p className="mt-3 text-center text-[11px] text-[#a88a94]">
                1 = nah · 5 = extremely delulu
              </p>
            </motion.div>
          )}

          {done && (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-8 text-center backdrop-blur"
            >
              <p className="text-xs font-semibold tracking-[0.18em] text-[#f7a8b8] uppercase">
                Delulu reading
              </p>
              <p className="mt-3 font-display text-6xl text-[#f2596f]">
                {score}
              </p>
              <div className="mx-auto mt-5 h-3 w-full max-w-xs overflow-hidden rounded-full bg-white/10">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-[#ff7a59] to-[#f2596f]"
                  initial={{ width: 0 }}
                  animate={{ width: `${score}%` }}
                  transition={{ duration: 0.7 }}
                />
              </div>
              <p className="mt-5 text-sm capitalize tracking-wide text-[#f7a8b8]">
                {band}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-[#fff7f1]/90">
                {config.bands[band]}
              </p>
              <button
                type="button"
                onClick={reset}
                className="mt-6 text-sm font-medium text-[#f7a8b8] underline-offset-4 hover:underline"
              >
                Retake
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
