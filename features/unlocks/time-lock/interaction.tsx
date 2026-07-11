"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, Clock, X } from "lucide-react";
import { useEffect, useState } from "react";

import type { ModuleInteractionProps } from "../types";
import type { TimeLockConfig } from "./index";

/** Break a positive millisecond span into whole days/hours/minutes/seconds. */
function parts(ms: number) {
  const clamped = Math.max(0, ms);
  const s = Math.floor(clamped / 1000);
  return {
    days: Math.floor(s / 86400),
    hours: Math.floor((s % 86400) / 3600),
    minutes: Math.floor((s % 3600) / 60),
    seconds: s % 60,
  };
}

function Unit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className="font-display text-3xl tabular-nums text-white">
        {String(value).padStart(2, "0")}
      </span>
      <span className="mt-1 text-[0.65rem] tracking-[0.2em] text-white/40 uppercase">
        {label}
      </span>
    </div>
  );
}

/**
 * The time-lock gate surface: a live countdown to `unlockAt`. There is no way to
 * bypass it — it simply ticks down, and the moment it reaches zero it flashes
 * "Unlocked" and calls `onSolve` (the host swaps to the memory). If the instant
 * has already passed when it mounts, it unlocks immediately. (Default export so
 * it can be lazy-loaded.)
 */
export default function TimeLockInteraction({
  config,
  onSolve,
  onClose,
}: ModuleInteractionProps<TimeLockConfig>) {
  const target = Date.parse(config.unlockAt);
  const [now, setNow] = useState(() => Date.now());
  const [solved, setSolved] = useState(() => target <= Date.now());

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    if (solved) {
      // Let the "Unlocked" flash play before revealing the memory.
      const id = window.setTimeout(onSolve, 650);
      return () => window.clearTimeout(id);
    }
    const id = window.setInterval(() => {
      const t = Date.now();
      setNow(t);
      if (target <= t) setSolved(true);
    }, 1000);
    return () => window.clearInterval(id);
  }, [solved, target, onSolve]);

  const remaining = parts(target - now);

  return (
    <motion.div
      className="pointer-events-auto absolute inset-0 z-20 flex items-center justify-center bg-black/55 px-6 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      onClick={onClose}
    >
      <motion.div
        className="relative w-full max-w-md rounded-3xl border border-white/10 bg-[#15122a] p-7 text-center text-white shadow-2xl"
        initial={{ scale: 0.9, y: 16 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 22 }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white/70 transition-colors hover:bg-black/60 hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="mb-5 flex items-center justify-center gap-2 text-xs tracking-[0.2em] text-[#7fd9ff] uppercase">
          <Clock className="h-3.5 w-3.5" />
          Sealed for now
        </div>

        <AnimatePresence mode="wait">
          {solved ? (
            <motion.div
              key="solved"
              className="flex flex-col items-center gap-2 py-4 text-[#7fd9ff]"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <Check className="h-7 w-7" />
              <span className="font-semibold">Unlocked</span>
            </motion.div>
          ) : (
            <motion.div key="waiting" exit={{ opacity: 0 }}>
              <div className="flex items-start justify-center gap-4">
                <Unit value={remaining.days} label="days" />
                <Unit value={remaining.hours} label="hrs" />
                <Unit value={remaining.minutes} label="min" />
                <Unit value={remaining.seconds} label="sec" />
              </div>
              <p className="mt-6 text-sm text-white/60">
                {config.teaser ||
                  "This memory opens when the time is right. Come back then."}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
