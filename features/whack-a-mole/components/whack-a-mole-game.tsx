"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Heart, RotateCcw, Sparkles } from "lucide-react";
import { useEffect, useEffectEvent } from "react";

import type { WhackAMoleConfig } from "@/features/whack-a-mole/config";
import { DIFFICULTY_LABELS } from "@/features/whack-a-mole/config";
import { TUNING } from "@/features/whack-a-mole/lib/engine";
import { resolveFaceSrc } from "@/features/whack-a-mole/lib/face";
import { usePlayStore } from "@/features/whack-a-mole/store";
import { cn } from "@/lib/utils";

import { ArcadeBoard } from "./arcade-board";
import { HeadInHole } from "./human-head";

type Props = {
  config: WhackAMoleConfig;
  faceUrl: string | null;
  className?: string;
};

/**
 * Full-viewport arcade. Mobile: HUD over a tall board.
 * Desktop (lg+): two-pane — sidebar stats + full-height playfield.
 */
export function WhackAMoleGame({ config, faceUrl, className }: Props) {
  const reduceMotion = useReducedMotion();
  const seed = usePlayStore((s) => s.seed);
  const begin = usePlayStore((s) => s.begin);
  const playAgain = usePlayStore((s) => s.playAgain);
  const advance = usePlayStore((s) => s.advance);
  const whack = usePlayStore((s) => s.whack);
  const clearQuip = usePlayStore((s) => s.clearQuip);
  const game = usePlayStore((s) => s.game);

  useEffect(() => {
    seed(config, faceUrl);
  }, [config, faceUrl, seed]);

  const onFrame = useEffectEvent((now: number, dt: number) => {
    advance(now, dt);
  });

  useEffect(() => {
    if (game.phase !== "playing") return;
    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(64, now - last);
      last = now;
      onFrame(now, dt);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [game.phase, onFrame]);

  useEffect(() => {
    if (!game.lastQuip) return;
    const t = window.setTimeout(() => clearQuip(), 900);
    return () => window.clearTimeout(t);
  }, [game.lastQuip, clearQuip]);

  const holeCount = TUNING[config.difficulty].holeCount;
  const seconds = Math.ceil(game.timeLeftMs / 1000);
  const fillParent = Boolean(className?.includes("min-h-0"));
  const faceSrc = resolveFaceSrc(faceUrl);

  return (
    <div
      className={cn(
        "relative isolate flex w-full flex-col overflow-hidden",
        fillParent ? "h-full min-h-0" : "h-dvh min-h-dvh",
        className,
      )}
    >
      <div
        aria-hidden
        className="absolute inset-0 -z-20"
        style={{
          background:
            "radial-gradient(ellipse 90% 70% at 50% -10%, #fffaf4 0%, #fbeede 45%, #f4e0cb 100%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.35]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='28'%3E%3Ccircle cx='2' cy='2' r='1.2' fill='%23c75b39' fill-opacity='0.12'/%3E%3C/svg%3E\")",
        }}
      />

      <AnimatePresence mode="wait">
        {game.phase === "intro" && (
          <motion.div
            key="intro"
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative z-10 flex h-full min-h-0 w-full flex-col lg:flex-row"
          >
            {/* Left / top: story */}
            <div className="flex flex-1 flex-col items-center justify-center px-5 py-8 text-center lg:items-start lg:px-12 lg:py-10 lg:text-left xl:px-16">
              <p className="text-[11px] font-semibold tracking-[0.22em] text-[#C75B39] uppercase">
                Whack My Face
              </p>
              <h1 className="mt-3 max-w-lg font-display text-3xl leading-tight text-[#3A2A25] sm:text-4xl lg:text-5xl">
                {config.title.trim() || "Whack my dumb face"}
              </h1>
              {config.intro.trim() && (
                <p className="mt-4 max-w-md text-sm leading-relaxed text-[#7A6258] sm:text-base">
                  {config.intro}
                </p>
              )}
              <div className="mt-6 flex flex-wrap items-center justify-center gap-2 lg:justify-start">
                <LegendDot className="bg-[#F2596F]" label="Face — smash" />
                <LegendDot className="bg-[#F0A13D]" label="Apology — collect" />
                <LegendDot className="bg-white" label={config.sacredLabel} />
              </div>
              <button
                type="button"
                onClick={begin}
                className="mt-8 inline-flex h-12 items-center justify-center rounded-full bg-gradient-to-r from-[#ff7a59] to-[#f2596f] px-8 text-sm font-semibold text-white shadow-[0_16px_40px_-16px_rgba(242,89,111,0.75)] transition-transform hover:-translate-y-0.5"
              >
                Grab the hammer
              </button>
            </div>

            {/* Right / bottom: face preview card */}
            <div className="flex flex-1 items-center justify-center px-5 pb-10 lg:px-10 lg:pb-0">
              <motion.div
                initial={reduceMotion ? false : { scale: 0.92, y: 12 }}
                animate={{ scale: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 22 }}
                className="relative flex aspect-square w-full max-w-[min(72vw,380px)] items-center justify-center lg:max-w-[min(42vh,440px)]"
              >
                <div className="absolute inset-0 rounded-[2rem] border border-[#f0e0d4] bg-white/70 shadow-[0_28px_60px_-30px_rgba(58,42,37,0.45)] backdrop-blur-sm" />
                <HeadInHole src={faceSrc} className="relative size-[78%]" />
                <p className="absolute bottom-5 left-0 right-0 text-center text-xs font-medium text-[#92786C]">
                  {DIFFICULTY_LABELS[config.difficulty].label} mode ·{" "}
                  {config.playerName.trim() || "You"} plays
                </p>
              </motion.div>
            </div>
          </motion.div>
        )}

        {game.phase === "playing" && (
          <motion.div
            key="playing"
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative z-10 flex h-full min-h-0 w-full flex-col lg:flex-row"
          >
            {/* Sidebar (desktop) / top bar (mobile) */}
            <aside className="flex shrink-0 flex-col gap-3 border-[#f0e0d4] px-4 py-3 sm:px-5 lg:w-[min(34%,360px)] lg:border-r lg:px-8 lg:py-8">
              <div className="flex items-center justify-between gap-3 lg:flex-col lg:items-stretch lg:gap-6">
                <div>
                  <p className="text-[10px] tracking-[0.18em] text-[#92786C] uppercase lg:text-xs">
                    {config.playerName.trim() || "You"}
                  </p>
                  <motion.p
                    key={game.score}
                    initial={reduceMotion ? false : { scale: 1.12 }}
                    animate={{ scale: 1 }}
                    className="font-display text-3xl leading-none text-[#3A2A25] lg:text-5xl"
                  >
                    {game.score}
                  </motion.p>
                  <p className="mt-1 hidden text-sm text-[#7A6258] lg:block">
                    {config.title.trim() || "Whack My Face"}
                  </p>
                </div>

                <div className="flex items-center gap-2 lg:flex-col lg:items-stretch lg:gap-3">
                  {game.apologiesCollected > 0 && (
                    <StatPill>
                      <Sparkles className="size-3.5 text-[#C75B39]" />
                      {game.apologiesCollected} apologies
                    </StatPill>
                  )}
                  {game.combo > 1 && (
                    <StatPill className="text-[#F2596F]">
                      Combo ×{game.combo}
                    </StatPill>
                  )}
                  <span
                    className={cn(
                      "rounded-full px-3 py-1.5 text-sm font-semibold tabular-nums lg:text-center lg:text-lg",
                      seconds <= 5
                        ? "bg-[#F2596F]/15 text-[#C75B39]"
                        : "bg-[#fff7f1] text-[#3A2A25]",
                    )}
                  >
                    {seconds}s
                  </span>
                </div>
              </div>

              <div className="mt-auto hidden space-y-3 lg:block">
                <div className="flex flex-wrap gap-2">
                  <LegendDot className="bg-[#F2596F]" label="Face" />
                  <LegendDot className="bg-[#F0A13D]" label="Apology" />
                  <LegendDot className="bg-white" label="Heart" />
                </div>
                <AnimatePresence>
                  {game.lastQuip && (
                    <motion.p
                      key={game.lastQuip + game.hits}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="font-display text-xl text-[#C21830]"
                    >
                      {game.lastQuip}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            </aside>

            {/* Playfield — takes remaining space */}
            <div className="relative min-h-0 flex-1 px-3 pb-3 pt-1 sm:px-5 sm:pb-5 lg:p-8">
              <ArcadeBoard
                holeCount={holeCount}
                moles={game.moles}
                faceUrl={faceSrc}
                onWhack={whack}
                className="h-full w-full"
              />
              {/* Mobile quip overlay */}
              <AnimatePresence>
                {game.lastQuip && (
                  <motion.p
                    key={game.lastQuip + game.hits}
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="pointer-events-none absolute inset-x-0 top-[12%] z-40 text-center font-display text-xl font-bold text-[#C21830] lg:hidden"
                    style={{
                      WebkitTextStroke: "1px #fff",
                      textShadow: "0 2px 0 rgba(58,42,37,0.15)",
                    }}
                  >
                    {game.lastQuip}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}

        {game.phase === "ended" && (
          <motion.div
            key="ended"
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative z-10 flex h-full min-h-0 w-full flex-col overflow-y-auto lg:flex-row"
          >
            <div className="flex flex-1 flex-col items-center justify-center px-5 py-8 text-center lg:items-start lg:px-12 lg:text-left xl:px-16">
              <p className="text-[11px] font-semibold tracking-[0.22em] text-[#C75B39] uppercase">
                Round over
              </p>
              <p className="mt-2 font-display text-5xl text-[#3A2A25] lg:text-6xl">
                {game.score}
                <span className="ml-2 text-xl text-[#92786C]">pts</span>
              </p>
              <p className="mt-2 text-sm text-[#7A6258]">
                {game.hits} hits · {game.misses} misses
                {game.apologiesCollected > 0
                  ? ` · ${game.apologiesCollected} apologies`
                  : ""}
                {game.sacredHits > 0 ? ` · ${game.sacredHits} oops hearts` : ""}
              </p>
              <button
                type="button"
                onClick={playAgain}
                className="mt-6 inline-flex h-11 items-center gap-2 rounded-full border border-[#e3d2c5] bg-white px-5 text-sm font-semibold text-[#3A2A25] transition-colors hover:border-[#ff7a59]/50"
              >
                <RotateCcw className="size-4" /> Play again
              </button>
            </div>

            <div className="flex flex-1 items-center justify-center px-5 pb-10 lg:px-10 lg:pb-0">
              <div className="w-full max-w-md rounded-[1.5rem] border border-[#F4DDD0] bg-white/90 px-6 py-7 text-left shadow-[0_24px_48px_-28px_rgba(58,42,37,0.4)] backdrop-blur-sm">
                <div className="flex items-center gap-2 text-[#C75B39]">
                  <Heart className="size-4 fill-[#F2596F] text-[#F2596F]" />
                  <h2 className="font-display text-2xl text-[#3A2A25]">
                    {config.apology.heading.trim() || "I'm sorry"}
                  </h2>
                </div>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-[#5c463c] sm:text-base">
                  {config.apology.body.trim() || "…"}
                </p>
                {config.apology.ask.trim() && (
                  <p className="mt-4 border-t border-[#F4DDD0] pt-4 text-sm font-medium text-[#C75B39]">
                    {config.apology.ask}
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function LegendDot({ className, label }: { className: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-[#f0e0d4] bg-white/85 px-2.5 py-1 text-[11px] text-[#7A6258] shadow-sm">
      <span
        className={cn(
          "size-2.5 rounded-full border border-[#3A2A25]/10",
          className,
        )}
      />
      <span className="max-w-[10rem] truncate">{label}</span>
    </span>
  );
}

function StatPill({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full bg-[#fff1e9] px-2.5 py-1 text-xs font-medium text-[#C75B39] lg:justify-center",
        className,
      )}
    >
      {children}
    </span>
  );
}
