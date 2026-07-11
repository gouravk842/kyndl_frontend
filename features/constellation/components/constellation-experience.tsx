"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useMemo, useState } from "react";

import { SKY_CONFIG, type SkyConfig, type Star } from "@/features/constellation/config";
import { useConstellationEngine } from "@/features/constellation/hooks/use-constellation-engine";
import { useFirstView } from "@/features/constellation/hooks/use-first-view";
import { useSkyAudio } from "@/features/constellation/hooks/use-sky-audio";
import { useUnlockedStars } from "@/features/constellation/hooks/use-unlocked-stars";
import {
  hasPendingChallenge,
  requirementsMet,
  type ResolvedGate,
  resolveGate,
} from "@/features/constellation/lib/gates";

import { ConstellationCanvas } from "./constellation-canvas";
import { ConstellationControls } from "./constellation-controls";
import { ConstellationEntrance } from "./constellation-entrance";
import { ConstellationHitLayer } from "./constellation-hit-layer";
import { GateSurface } from "./gate-surface";
import { MemoryCard } from "./memory-card";

/**
 * The whole Constellation, assembled. The engine hook owns the canvas loop,
 * camera and interaction state; this component sequences the experience around
 * it — the one-time entrance ceremony, the cinematic tour, free exploration,
 * the finale — and wires in sound, the first-view gate, and the catchable wish.
 */
/**
 * The whole Constellation, assembled. Reads its content from
 * {@link ConstellationExperienceProps.config} (defaults to the bundled sample so
 * the live page renders without wiring); the builder passes its draft here.
 *
 * In `preview` mode the one-time entrance ceremony and auto-tour are skipped so
 * the editor sees their sky immediately on every remount.
 */
type ConstellationExperienceProps = {
  config?: SkyConfig;
  preview?: boolean;
  /** fileId → presigned URL, for gate photos (jigsaw). Merged builder previews
   * flow through here too so an uploaded image shows before it's saved. */
  assets?: Record<string, string>;
};

export function ConstellationExperience({
  config = SKY_CONFIG,
  preview = false,
  assets = {},
}: ConstellationExperienceProps) {
  // Which stars this viewer has already cleared (persisted per-sky). A cleared
  // star never re-challenges, and satisfies the `requires` trail for later ones.
  const { cleared, markCleared } = useUnlockedStars(config.id);

  // May the cinematic tour auto-open this star? Not if it's still blocked by an
  // unmet requirement or hidden behind an unsolved challenge.
  const canOpen = useCallback(
    (id: number) => {
      const star = config.stars.find((s) => s.id === id);
      if (!star) return false;
      if (!requirementsMet(star, cleared)) return false;
      return cleared.has(id) || !hasPendingChallenge(star);
    },
    [config.stars, cleared],
  );

  const engine = useConstellationEngine(config, {
    onOpen: markCleared,
    canOpen,
  });
  const {
    canvasRef,
    reduceMotion,
    openedIds,
    activeStar,
    hoveredId,
    activeId,
    setHoveredId,
    openStar,
    closeStar,
    allOpened,
    entered,
    total,
    started,
    begin,
    touring,
    tourPaused,
    startTour,
    pauseTour,
    resumeTour,
    stopTour,
    caughtWish,
    dismissWish,
    tryCatchWish,
  } = engine;

  // A star tapped while its gate is still shut raises the challenge here.
  const [pendingGate, setPendingGate] = useState<{
    star: Star;
    gate: ResolvedGate;
  } | null>(null);
  // A brief nudge when a still-locked (requirements-unmet) star is tapped.
  const [lockedHint, setLockedHint] = useState<Star | null>(null);

  useEffect(() => {
    if (!lockedHint) return;
    const t = window.setTimeout(() => setLockedHint(null), 2600);
    return () => window.clearTimeout(t);
  }, [lockedHint]);

  // Tapping a star: reveal it if it's open, raise its challenge if gated, or
  // nudge if it's still waiting on earlier stars.
  const handleOpen = useCallback(
    (id: number) => {
      const star = config.stars.find((s) => s.id === id);
      if (!star) return;
      if (!requirementsMet(star, cleared)) {
        setLockedHint(star);
        return;
      }
      if (cleared.has(id) || !hasPendingChallenge(star)) {
        openStar(id);
        return;
      }
      const gate = resolveGate(star, assets);
      if (!gate) {
        openStar(id);
        return;
      }
      setPendingGate({ star, gate });
    },
    [config.stars, cleared, openStar, assets],
  );

  const solvePendingGate = useCallback(() => {
    // Called from the gate's onSolve (an event/timeout), so these setStates run
    // outside render. Open first, then dismiss the challenge. (Opening must not
    // happen inside a setState updater — that runs during render and would fire
    // the persist listener mid-render.)
    if (pendingGate) openStar(pendingGate.star.id); // engine's onOpen persists it
    setPendingGate(null);
  }, [pendingGate, openStar]);

  // Star ids blocked by unmet requirements vs. hidden behind an unsolved gate —
  // drives the lock affordances in the hit layer.
  const { blockedIds, gatedIds } = useMemo(() => {
    const blocked = new Set<number>();
    const gated = new Set<number>();
    for (const star of config.stars) {
      if (cleared.has(star.id)) continue;
      if (!requirementsMet(star, cleared)) blocked.add(star.id);
      else if (hasPendingChallenge(star)) gated.add(star.id);
    }
    return { blockedIds: blocked, gatedIds: gated };
  }, [config.stars, cleared]);

  const { isFirstView, markViewed } = useFirstView(config.id);
  const { muted, unlock, toggleMuted } = useSkyAudio(
    config.sound,
    openedIds.size,
    total,
  );

  // Returning visitors skip the ceremony — settle straight into the keepsake.
  // The builder's preview always skips it, so edits show up instantly.
  useEffect(() => {
    if ((preview || isFirstView === false) && !started) begin(false);
  }, [preview, isFirstView, started, begin]);

  // First-ever open: the tap starts the dramatic entrance, unlocks audio, and
  // auto-plays the guided story.
  const handleBegin = useCallback(() => {
    markViewed();
    unlock();
    begin(true);
    if (config.tour.enabled) startTour();
  }, [markViewed, unlock, begin, startTour, config.tour.enabled]);

  const showGate = !preview && isFirstView === true && !started;
  const interactive = started && !touring;
  const titleVisible = (entered || reduceMotion) && !touring;

  return (
    <div
      className="relative h-full w-full select-none"
      onPointerDown={(e) => {
        if (interactive) tryCatchWish(e.clientX, e.clientY);
      }}
    >
      <ConstellationCanvas canvasRef={canvasRef} />

      <ConstellationHitLayer
        stars={config.stars}
        openedIds={openedIds}
        hoveredId={hoveredId}
        activeId={activeId}
        blockedIds={blockedIds}
        gatedIds={gatedIds}
        reduceMotion={reduceMotion}
        interactive={interactive}
        onHover={setHoveredId}
        onOpen={handleOpen}
      />

      {/* constellation name, once the sky has assembled (hidden during the tour) */}
      <motion.header
        className="pointer-events-none absolute inset-x-0 top-0 flex flex-col items-center px-6 pt-[max(2rem,env(safe-area-inset-top))] text-center"
        initial={false}
        animate={{ opacity: titleVisible ? 1 : 0, y: titleVisible ? 0 : -8 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
      >
        <h1 className="font-serif text-2xl tracking-wide text-[#f6efdd] sm:text-3xl [text-shadow:0_2px_18px_rgba(0,0,0,0.7)]">
          {config.constellationName}
        </h1>
        <p className="font-serif mt-1 text-sm text-[#b9b2d0] [text-shadow:0_1px_10px_rgba(0,0,0,0.8)]">
          {config.subtitle}
        </p>
      </motion.header>

      {/* progress / closing line, low in the sky */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col items-center px-6 pb-[max(2rem,env(safe-area-inset-bottom))] text-center">
        <AnimatePresence mode="wait">
          {allOpened ? (
            <motion.p
              key="finale"
              className="font-serif max-w-md text-base leading-relaxed text-[#f3ead2] [text-shadow:0_1px_12px_rgba(0,0,0,0.8)]"
              initial={reduceMotion ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
            >
              {config.allStarsOpenedMessage}
            </motion.p>
          ) : (
            <motion.p
              key="progress"
              className="text-xs font-medium tracking-[0.22em] text-[#9a96b8] uppercase"
              initial={reduceMotion ? false : { opacity: 0 }}
              animate={{ opacity: titleVisible ? 1 : 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
            >
              {openedIds.size} of {total} remembered
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* tour + sound controls, once entered */}
      {started && entered ? (
        <ConstellationControls
          tourEnabled={config.tour.enabled}
          touring={touring}
          tourPaused={tourPaused}
          onPlay={startTour}
          onPause={pauseTour}
          onResume={resumeTour}
          onExplore={stopTour}
          soundEnabled={config.sound.enabled}
          muted={muted}
          onToggleMute={toggleMuted}
        />
      ) : null}

      {/* the opened memory */}
      <AnimatePresence>
        {activeStar ? (
          <MemoryCard
            key={activeStar.id}
            star={activeStar}
            onClose={closeStar}
          />
        ) : null}
      </AnimatePresence>

      {/* a star's gate challenge — solve it and the memory opens */}
      <AnimatePresence>
        {pendingGate ? (
          <GateSurface
            key={pendingGate.star.id}
            type={pendingGate.gate.type}
            config={pendingGate.gate.config}
            onSolve={solvePendingGate}
            onClose={() => setPendingGate(null)}
          />
        ) : null}
      </AnimatePresence>

      {/* a nudge when a still-locked star is tapped before its turn */}
      <AnimatePresence>
        {lockedHint ? (
          <motion.div
            key="locked-hint"
            className="pointer-events-none absolute inset-x-0 bottom-24 z-[60] flex justify-center px-6"
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <span className="font-serif rounded-full bg-black/60 px-5 py-2.5 text-sm text-[#f3ead2] backdrop-blur-sm [text-shadow:0_1px_8px_rgba(0,0,0,0.8)]">
              Read the stars before it first — this one isn&apos;t ready yet.
            </span>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* a caught wish */}
      <AnimatePresence>
        {caughtWish ? (
          <motion.div
            className="fixed inset-0 z-[65] flex items-center justify-center p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={dismissWish}
          >
            <div
              aria-hidden
              className="absolute inset-0"
              style={{ background: "rgba(2,6,18,0.55)" }}
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="A caught wish"
              className="font-serif relative max-w-sm text-center text-lg leading-relaxed text-[#f6efdd] [text-shadow:0_1px_14px_rgba(0,0,0,0.9)]"
              onClick={(e) => e.stopPropagation()}
              initial={
                reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.92 }
              }
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              {caughtWish.message}
              <button
                type="button"
                onClick={dismissWish}
                className="mt-6 block w-full text-xs tracking-[0.2em] text-[#c8b88a] uppercase outline-none focus-visible:text-[#f6efdd]"
              >
                tap to close
              </button>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* the one-time entrance ceremony */}
      <AnimatePresence>
        {showGate ? (
          <ConstellationEntrance
            recipientName={config.recipientName}
            onBegin={handleBegin}
          />
        ) : null}
      </AnimatePresence>
    </div>
  );
}
