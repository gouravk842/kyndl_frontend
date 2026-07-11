"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import type { CountdownTheme } from "../config";
import type { Remaining } from "../lib/time";

/**
 * The four ticking units. Each digit lives in an overflow-clipped well and
 * slides up when its value changes, giving a clean split-flap feel — most
 * visible on the seconds, subtle everywhere else.
 */
export function Clock({
  remaining,
  theme,
}: {
  remaining: Remaining;
  theme: CountdownTheme;
}) {
  const units: { label: string; value: number; pad: number }[] = [
    { label: "days", value: remaining.days, pad: 2 },
    { label: "hours", value: remaining.hours, pad: 2 },
    { label: "minutes", value: remaining.minutes, pad: 2 },
    { label: "seconds", value: remaining.seconds, pad: 2 },
  ];

  return (
    <div className="flex items-stretch justify-center gap-2 sm:gap-3 md:gap-4">
      {units.map((u, i) => (
        <div key={u.label} className="flex items-stretch">
          <Unit label={u.label} value={u.value} pad={u.pad} theme={theme} />
          {i < units.length - 1 && (
            <span
              aria-hidden
              className="mx-0.5 self-center pb-5 text-2xl font-light opacity-40 sm:mx-1 sm:text-4xl"
              style={{ color: theme.digit }}
            >
              :
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

function Unit({
  label,
  value,
  pad,
  theme,
}: {
  label: string;
  value: number;
  pad: number;
  theme: CountdownTheme;
}) {
  const reduceMotion = useReducedMotion();
  const text = String(value).padStart(pad, "0");

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className="relative grid h-[clamp(64px,18vw,128px)] w-[clamp(56px,16vw,116px)] place-items-center overflow-hidden rounded-2xl border shadow-[0_10px_30px_-12px_rgba(0,0,0,0.45)] backdrop-blur-md"
        style={{ background: theme.card, borderColor: theme.cardBorder }}
      >
        {/* a soft top sheen across the card face */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-1/2 rounded-t-2xl bg-gradient-to-b from-white/25 to-transparent"
        />
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={text}
            className="font-display text-[clamp(2rem,9vw,4.25rem)] leading-none font-semibold tabular-nums"
            style={{ color: theme.digit }}
            initial={reduceMotion ? false : { y: "-90%", opacity: 0 }}
            animate={{ y: "0%", opacity: 1 }}
            exit={reduceMotion ? { opacity: 0 } : { y: "90%", opacity: 0 }}
            transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
          >
            {text}
          </motion.span>
        </AnimatePresence>
      </div>
      <span
        className="text-[0.6rem] font-semibold tracking-[0.22em] uppercase sm:text-xs"
        style={{ color: theme.label }}
      >
        {label}
      </span>
    </div>
  );
}
