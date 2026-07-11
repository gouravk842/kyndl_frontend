"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Heart, Pause, Play, RotateCcw, SkipBack, SkipForward, X } from "lucide-react";
import { useEffect, useRef } from "react";

import { PLACES } from "../config";
import { useOurPlacesStore } from "../store";

/** How long each scene holds before auto-advancing. The typewriter is paced to
 *  finish comfortably inside this (see story-card). */
export const SCENE_MS = 6800;

/**
 * Story Mode — the cinematic "play our story" layer over the map. This overlay
 * owns everything that isn't the map itself: the play invitation, the playback
 * controls, the auto-advance timer (a rAF loop that also drives the scene
 * progress bar so the two never drift), the film letterbox, and the closing
 * card. The map reacts to `activeId` exactly as in free-roam, so flying and the
 * memory reveal come for free.
 */
export function StoryMode() {
  const storyIndex = useOurPlacesStore((s) => s.storyIndex);
  const isPlaying = useOurPlacesStore((s) => s.isPlaying);
  const startStory = useOurPlacesStore((s) => s.startStory);
  const togglePlay = useOurPlacesStore((s) => s.togglePlay);
  const nextScene = useOurPlacesStore((s) => s.nextScene);
  const prevScene = useOurPlacesStore((s) => s.prevScene);
  const exitStory = useOurPlacesStore((s) => s.exitStory);
  const reduceMotion = useReducedMotion() ?? false;

  const inStory = storyIndex !== null;
  const isClosing = storyIndex === PLACES.length;
  const isScene = inStory && !isClosing;
  const sceneNo = isScene ? (storyIndex ?? 0) + 1 : PLACES.length;

  // ── Auto-advance + synced progress bar ──────────────────────────
  const barRef = useRef<HTMLDivElement>(null);
  const elapsedRef = useRef(0);

  // New scene → reset the progress clock and bar.
  useEffect(() => {
    elapsedRef.current = 0;
    if (barRef.current) barRef.current.style.width = "0%";
  }, [storyIndex]);

  useEffect(() => {
    if (!isScene || !isPlaying) return;
    const dur = reduceMotion ? SCENE_MS * 0.85 : SCENE_MS;
    let raf = 0;
    const base = performance.now() - elapsedRef.current;
    const tick = (now: number) => {
      elapsedRef.current = now - base;
      const p = Math.min(1, elapsedRef.current / dur);
      if (barRef.current) barRef.current.style.width = `${p * 100}%`;
      if (p >= 1) {
        elapsedRef.current = 0;
        nextScene();
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [isScene, isPlaying, storyIndex, reduceMotion, nextScene]);

  // ── Keyboard: space = play/pause, arrows = step, esc = exit ──────
  useEffect(() => {
    if (!inStory) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === " ") {
        e.preventDefault();
        togglePlay();
      } else if (e.key === "ArrowRight") nextScene();
      else if (e.key === "ArrowLeft") prevScene();
      else if (e.key === "Escape") exitStory();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [inStory, togglePlay, nextScene, prevScene, exitStory]);

  return (
    <>
      {/* Film letterbox — thin bars that frame the playback. */}
      <div
        aria-hidden
        className={[
          "pointer-events-none absolute inset-x-0 top-0 z-[1400] bg-[#1a120e] transition-all duration-700",
          inStory ? "h-[3.5%] opacity-90" : "h-0 opacity-0",
        ].join(" ")}
      />
      <div
        aria-hidden
        className={[
          "pointer-events-none absolute inset-x-0 bottom-0 z-[1400] bg-[#1a120e] transition-all duration-700",
          inStory ? "h-[3.5%] opacity-90" : "h-0 opacity-0",
        ].join(" ")}
      />

      {/* Play invitation (free-roam only). */}
      <AnimatePresence>
        {!inStory && (
          <motion.div
            key="invite"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.4 }}
            className="pointer-events-none absolute bottom-6 left-1/2 z-[1100] -translate-x-1/2"
          >
            <button
              type="button"
              onClick={startStory}
              className="pointer-events-auto group inline-flex items-center gap-2.5 rounded-full bg-gradient-to-r from-[#ff7a59] to-[#f2596f] py-3 pr-6 pl-5 text-sm font-semibold text-white shadow-[0_14px_40px_-12px_rgba(242,89,111,0.7)] outline-none transition-all duration-300 hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-white"
            >
              <span className="grid size-7 place-items-center rounded-full bg-white/25 transition-colors group-hover:bg-white/35">
                <Play className="size-3.5 translate-x-px fill-current" />
              </span>
              Play our story
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Playback controls (scene playing). */}
      <AnimatePresence>
        {isScene && (
          <motion.div
            key="controls"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.35 }}
            className="absolute bottom-5 left-1/2 z-[1100] w-[min(92vw,24rem)] -translate-x-1/2"
          >
            <div className="rounded-2xl border border-[#f2dace]/70 bg-[#fff7f1]/85 px-4 pt-3 pb-3.5 shadow-[0_16px_44px_-18px_rgba(58,42,37,0.6)] backdrop-blur-md">
              {/* progress bar */}
              <div className="mb-3 h-1 w-full overflow-hidden rounded-full bg-[#f0d9cb]">
                <div
                  ref={barRef}
                  className="h-full rounded-full bg-gradient-to-r from-[#ff7a59] to-[#f2596f]"
                  style={{ width: "0%" }}
                />
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="w-12 text-[11px] font-semibold tracking-wide text-[#92786c] tabular-nums">
                  {sceneNo} / {PLACES.length}
                </span>
                <div className="flex items-center gap-1.5">
                  <CtrlButton label="Previous place" onClick={prevScene}>
                    <SkipBack className="size-4" />
                  </CtrlButton>
                  <button
                    type="button"
                    aria-label={isPlaying ? "Pause" : "Play"}
                    onClick={togglePlay}
                    className="grid size-10 place-items-center rounded-full bg-gradient-to-r from-[#ff7a59] to-[#f2596f] text-white shadow-md outline-none transition-transform hover:scale-105 focus-visible:ring-2 focus-visible:ring-[#ff7a59]"
                  >
                    {isPlaying ? (
                      <Pause className="size-4 fill-current" />
                    ) : (
                      <Play className="size-4 translate-x-px fill-current" />
                    )}
                  </button>
                  <CtrlButton label="Next place" onClick={nextScene}>
                    <SkipForward className="size-4" />
                  </CtrlButton>
                </div>
                <div className="flex w-12 justify-end">
                  <CtrlButton label="Exit story" onClick={exitStory}>
                    <X className="size-4" />
                  </CtrlButton>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Closing card. */}
      <AnimatePresence>
        {isClosing && (
          <motion.div
            key="closing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 z-[1300] grid place-items-center bg-[#1a120e]/35 px-6 backdrop-blur-[2px]"
          >
            <motion.div
              initial={reduceMotion ? false : { scale: 0.94, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="w-[min(92vw,26rem)] rounded-3xl border border-[#f2dace] bg-[#fffaf4] px-8 py-10 text-center shadow-[0_30px_80px_-30px_rgba(58,42,37,0.7)]"
            >
              <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-[#fbd9ce] text-[#c75b39]">
                <Heart className="size-6 fill-current" />
              </span>
              <h2 className="font-hand mt-5 text-3xl text-[#2a1f1f]">
                …and the map keeps growing.
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-[#7a6258]">
                {PLACES.length} places so far, and every one of them is you.
                Here&rsquo;s to all the pins we haven&rsquo;t dropped yet.
              </p>
              <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={startStory}
                  className="inline-flex h-11 items-center gap-2 rounded-full bg-gradient-to-r from-[#ff7a59] to-[#f2596f] px-6 text-sm font-semibold text-white shadow-md outline-none transition-transform hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-[#ff7a59]"
                >
                  <RotateCcw className="size-4" />
                  Play again
                </button>
                <button
                  type="button"
                  onClick={exitStory}
                  className="inline-flex h-11 items-center rounded-full border border-[#f2dace] bg-white/70 px-6 text-sm font-medium text-[#3a2a25] outline-none transition-colors hover:bg-white focus-visible:ring-2 focus-visible:ring-[#ff7a59]"
                >
                  Explore the map
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function CtrlButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="grid size-9 place-items-center rounded-full text-[#6b5246] outline-none transition-colors hover:bg-[#fbeee6] hover:text-[#c75b39] focus-visible:ring-2 focus-visible:ring-[#ff7a59]"
    >
      {children}
    </button>
  );
}
