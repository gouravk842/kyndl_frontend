"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";

import {
  COUNTDOWN_CONFIG,
  type CountdownConfig,
  type MediaRef,
  themeFor,
} from "@/features/countdown/config";
import { cn } from "@/lib/utils";

import { formatTarget, type Remaining, remainingFrom } from "../lib/time";
import { BackgroundMusic } from "./background-music";
import { Clock } from "./clock";
import { Confetti } from "./confetti";
import { Reveal } from "./reveal";
import { WaitingNotes } from "./waiting-notes";

const ZERO: Remaining = {
  days: 0,
  hours: 0,
  minutes: 0,
  seconds: 0,
  total: 0,
  reached: false,
};

type CountdownExperienceProps = {
  config?: CountdownConfig;
  /** Resolved media URLs keyed by fileId (reveal photo + music). */
  assets?: Record<string, string>;
  /** Force the surprise open regardless of the clock (builder "peek"). */
  forceReveal?: boolean;
  /** Whether to mount the reveal's looping music (off for hidden instances). */
  playMusic?: boolean;
  /** Root min-height utility — overridden per host (page vs. builder pane). */
  className?: string;
};

/**
 * The live countdown. Ticks to {@link CountdownConfig.targetDate}; while it
 * counts, the recipient can open the waiting notes. At zero — or when the
 * builder asks for a peek — the clock dissolves into the reveal, with confetti
 * and optional music. Self-themed from `config.theme`, so the public viewer can
 * render it with nothing but content + assets.
 *
 * Time is only read after mount, so the server and first client render agree
 * (a quiet 00:00:00) and there's no hydration mismatch.
 */
export function CountdownExperience({
  config = COUNTDOWN_CONFIG,
  assets = {},
  forceReveal = false,
  playMusic = true,
  className = "min-h-dvh",
}: CountdownExperienceProps) {
  const reduceMotion = useReducedMotion();
  const theme = themeFor(config.theme);

  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- read the clock once after mount so SSR and the first client render agree
    setNow(Date.now());
    const reached = remainingFrom(config.targetDate, Date.now()).reached;
    if (reached) return; // already there — no need to tick
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [config.targetDate]);

  const remaining = now === null ? ZERO : remainingFrom(config.targetDate, now);
  const showReveal = forceReveal || remaining.reached;

  const urlFor = (ref: MediaRef | null | undefined) =>
    ref ? (assets[ref.fileId] ?? null) : null;
  const musicUrl = urlFor(config.music);

  return (
    <div
      className={cn(
        "relative isolate flex w-full flex-col items-center justify-center overflow-hidden px-4 py-14",
        className,
      )}
    >
      {/* themed full-bleed background */}
      <div
        aria-hidden
        className="absolute inset-0 -z-20"
        style={{ background: theme.background }}
      />
      {/* soft grain for tactility */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.05] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />
      {/* glow behind the clock — breathes once the moment lands */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute top-[34%] left-1/2 -z-10 h-[560px] w-[560px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
        style={{ background: theme.glow }}
        animate={
          reduceMotion
            ? undefined
            : showReveal
              ? { scale: [1, 1.18, 1], opacity: [0.8, 1, 0.8] }
              : { opacity: 0.75 }
        }
        transition={
          showReveal
            ? { duration: 3.4, repeat: Infinity, ease: "easeInOut" }
            : { duration: 0.8 }
        }
      />

      <div className="relative z-10 flex flex-col items-center text-center">
        <AnimatePresence mode="wait">
          {showReveal ? (
            <Reveal
              key="reveal"
              config={config}
              theme={theme}
              imageUrl={urlFor(config.reveal.image)}
            />
          ) : (
            <motion.div
              key="counting"
              className="flex flex-col items-center"
              initial={reduceMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.5 }}
            >
              {config.occasion && (
                <p
                  className="mb-2 text-xs font-semibold tracking-[0.3em] uppercase"
                  style={{ color: theme.accent }}
                >
                  {config.occasion}
                </p>
              )}
              <h1
                className="mb-1 max-w-2xl font-display text-3xl leading-tight font-semibold sm:text-4xl md:text-5xl"
                style={{ color: theme.digit }}
              >
                {config.title}
              </h1>
              <p
                className="font-hand mb-8 text-xl sm:text-2xl"
                style={{ color: theme.label }}
              >
                for {config.recipientName}
              </p>

              <Clock remaining={remaining} theme={theme} />

              {config.anticipationMessage && (
                <p
                  className="mt-8 max-w-md text-base leading-relaxed"
                  style={{ color: theme.label }}
                >
                  {config.anticipationMessage}
                </p>
              )}

              <p
                className="mt-4 text-xs font-medium tracking-wide opacity-70"
                style={{ color: theme.label }}
              >
                {formatTarget(config.targetDate)}
              </p>

              <WaitingNotes notes={config.notes} theme={theme} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {showReveal && <Confetti colors={theme.confetti} />}
      {showReveal && playMusic && musicUrl ? (
        <BackgroundMusic src={musicUrl} />
      ) : null}
    </div>
  );
}
