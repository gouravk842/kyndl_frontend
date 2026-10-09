"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, Lock, X } from "lucide-react";
import { useEffect, useState } from "react";

import { matchesAnswer } from "../answer-hash";
import type { ModuleInteractionProps } from "../types";
import type { QuestionConfig } from "./index";

type Status = "idle" | "wrong" | "solved";

/**
 * The question gate surface. Free-text or multiple-choice; a correct answer
 * flashes "Unlocked" and then calls `onSolve` (the host swaps to the reward).
 * A wrong answer shakes and reveals the optional hint. (Default export so it can
 * be lazy-loaded.)
 */
export default function QuestionInteraction({
  config,
  onSolve,
  onClose,
}: ModuleInteractionProps<QuestionConfig>) {
  const [value, setValue] = useState("");
  const [status, setStatus] = useState<Status>("idle");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const attempt = (answer: string) => {
    void matchesAnswer(answer, config.answers, config.answerHashes).then(
      (ok) => {
        if (ok) {
          setStatus("solved");
          window.setTimeout(onSolve, 650);
        } else {
          setStatus("wrong");
        }
      },
    );
  };

  return (
    <motion.div
      className="pointer-events-auto absolute inset-0 z-20 flex items-center justify-center bg-black/55 px-6 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      onClick={onClose}
    >
      <motion.div
        className="relative w-full max-w-md rounded-3xl border border-white/10 bg-[#15122a] p-7 text-white shadow-2xl"
        initial={{ scale: 0.9, y: 16 }}
        animate={
          status === "wrong"
            ? { scale: 1, y: 0, x: [0, -10, 10, -6, 6, 0] }
            : { scale: 1, y: 0 }
        }
        transition={{
          type: "spring",
          stiffness: 260,
          damping: 22,
          // The wrong-answer shake is a 6-keyframe array; springs only support
          // two keyframes, so drive x with a tween instead.
          x: { type: "tween", duration: 0.4, ease: "easeInOut" },
        }}
        onClick={(e) => e.stopPropagation()}
        onAnimationComplete={() => status === "wrong" && setStatus("idle")}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white/70 transition-colors hover:bg-black/60 hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="mb-5 flex items-center gap-2 text-xs tracking-[0.2em] text-[#7fd9ff] uppercase">
          <Lock className="h-3.5 w-3.5" />
          Locked memory
        </div>

        <h2 className="font-display text-2xl leading-snug">{config.prompt}</h2>

        <AnimatePresence>
          {status === "solved" ? (
            <motion.div
              key="solved"
              className="mt-6 flex items-center gap-2 text-[#7fd9ff]"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <Check className="h-5 w-5" />
              <span className="font-semibold">Unlocked</span>
            </motion.div>
          ) : config.choices && config.choices.length > 0 ? (
            <div key="choices" className="mt-6 grid gap-2.5">
              {config.choices.map((choice) => (
                <button
                  key={choice}
                  type="button"
                  onClick={() => attempt(choice)}
                  className="rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-left text-sm text-white/90 transition-colors hover:border-[#7fd9ff]/60 hover:bg-[#7fd9ff]/10"
                >
                  {choice}
                </button>
              ))}
            </div>
          ) : (
            <form
              key="text"
              className="mt-6 flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                attempt(value);
              }}
            >
              <input
                autoFocus
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="Your answer…"
                className="h-11 flex-1 rounded-full border border-white/15 bg-black/30 px-4 text-sm text-white outline-none placeholder:text-white/40 focus:border-[#7fd9ff]/60"
              />
              <button
                type="submit"
                className="h-11 rounded-full bg-[#7fd9ff] px-5 text-sm font-semibold text-[#0b0a1a] transition-transform hover:scale-105"
              >
                Unlock
              </button>
            </form>
          )}
        </AnimatePresence>

        {status === "wrong" && config.hint && (
          <p className="mt-4 text-sm text-white/55">Hint: {config.hint}</p>
        )}
        {status === "wrong" && !config.hint && (
          <p className="mt-4 text-sm text-white/55">Not quite — try again.</p>
        )}
      </motion.div>
    </motion.div>
  );
}
