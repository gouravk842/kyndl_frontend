"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

import { useTypewriter } from "../hooks/use-typewriter";
import { themeTokens } from "../lib/themes";
import type { MomentBeat, MomentTheme } from "../types";

/**
 * The paced walk-up to the question. One beat at a time, full screen, advanced
 * only by a deliberate tap — there is no scroll-ahead. The forced slowness is
 * the whole point: it builds the held breath. When the last beat is passed,
 * `onArrive` hands off to the question.
 */
export function ApproachPhase({
  theme,
  beats,
  assets,
  onArrive,
}: {
  theme: MomentTheme;
  beats: MomentBeat[];
  assets: Record<string, string>;
  onArrive: () => void;
}) {
  const t = themeTokens(theme);
  const [index, setIndex] = useState(0);
  const [skip, setSkip] = useState(0); // bump to force-complete the current line
  const beat = beats[index];

  function advance() {
    if (index + 1 >= beats.length) onArrive();
    else {
      setIndex((i) => i + 1);
      setSkip(0);
    }
  }

  // A line beat reveals letter-by-letter; first tap completes it, next advances.
  function handleTap() {
    if (beat?.kind === "line") {
      setSkip((s) => s + 1);
    } else {
      advance();
    }
  }

  if (!beat) return null;

  return (
    <button
      type="button"
      onClick={handleTap}
      className="relative flex size-full cursor-pointer items-center justify-center px-8 text-center outline-none"
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={beat.id}
          className="flex max-w-xl flex-col items-center gap-6"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          {beat.kind === "line" && (
            <Line
              key={skip /* remount to force-complete on tap */}
              text={beat.text}
              forceDone={skip > 0}
              className={cn("text-3xl leading-snug sm:text-4xl", t.text)}
              onDone={() => {
                if (skip > 0) advance();
              }}
              hintClassName={t.muted}
            />
          )}

          {beat.kind === "photo" && (
            <PhotoBeat
              url={assets[beat.fileId]}
              caption={beat.caption}
              theme={theme}
            />
          )}

          {beat.kind === "counter" && (
            <CounterBeat label={beat.label} sinceDate={beat.sinceDate} theme={theme} />
          )}
        </motion.div>
      </AnimatePresence>

      <Progress count={beats.length} index={index} theme={theme} />
    </button>
  );
}

function Line({
  text,
  forceDone,
  onDone,
  className,
  hintClassName,
}: {
  text: string;
  forceDone: boolean;
  onDone: () => void;
  className?: string;
  hintClassName?: string;
}) {
  const { shown, done } = useTypewriter(text);
  const visible = forceDone ? text : shown;
  const finished = forceDone || done;

  useEffect(() => {
    if (forceDone) onDone();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [forceDone]);

  return (
    <>
      <p className={className}>
        {visible}
        {!finished && <span className="animate-pulse">|</span>}
      </p>
      {finished && (
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className={cn("text-xs uppercase tracking-[0.3em]", hintClassName)}
        >
          tap to continue
        </motion.span>
      )}
    </>
  );
}

function PhotoBeat({
  url,
  caption,
  theme,
}: {
  url?: string;
  caption?: string;
  theme: MomentTheme;
}) {
  const t = themeTokens(theme);
  return (
    <div className="flex flex-col items-center gap-4">
      <div
        className={cn(
          "relative h-72 w-60 overflow-hidden rounded-lg border-4 border-white/90 shadow-2xl",
        )}
      >
        {url ? (
          <Image src={url} alt={caption ?? ""} fill className="object-cover" sizes="240px" />
        ) : (
          <div className="flex size-full items-center justify-center bg-black/20 text-xs text-white/50">
            photo
          </div>
        )}
      </div>
      {caption && <p className={cn("font-hand text-2xl", t.text)}>{caption}</p>}
      <span className={cn("text-xs uppercase tracking-[0.3em]", t.muted)}>
        tap to continue
      </span>
    </div>
  );
}

function CounterBeat({
  label,
  sinceDate,
  theme,
}: {
  label: string;
  sinceDate: string;
  theme: MomentTheme;
}) {
  const t = themeTokens(theme);
  const [days, setDays] = useState<number | null>(null);

  // Computed on the client only, so SSR and client agree (no hydration drift).
  useEffect(() => {
    const start = new Date(sinceDate).getTime();
    if (Number.isNaN(start)) return;
    const diff = Math.max(0, Math.floor((Date.now() - start) / 86_400_000));
    // eslint-disable-next-line react-hooks/set-state-in-effect -- read the clock once after mount so SSR and the first client render agree
    setDays(diff);
  }, [sinceDate]);

  return (
    <div className="flex flex-col items-center gap-3">
      <motion.span
        key={days}
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 160, damping: 14 }}
        className={cn("text-7xl font-semibold tabular-nums sm:text-8xl", t.text)}
      >
        {days ?? "…"}
      </motion.span>
      <p className={cn("text-lg", t.muted)}>{label}</p>
      <span className={cn("mt-2 text-xs uppercase tracking-[0.3em]", t.muted)}>
        tap to continue
      </span>
    </div>
  );
}

function Progress({
  count,
  index,
  theme,
}: {
  count: number;
  index: number;
  theme: MomentTheme;
}) {
  const t = themeTokens(theme);
  return (
    <div className="absolute bottom-10 left-1/2 flex -translate-x-1/2 gap-2">
      {Array.from({ length: count }, (_, i) => (
        <span
          key={i}
          className={cn(
            "h-1.5 rounded-full transition-all duration-500",
            i <= index ? "w-6" : "w-1.5 opacity-40",
          )}
          style={{ background: `rgb(${t.particle})` }}
        />
      ))}
    </div>
  );
}
