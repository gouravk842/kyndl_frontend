"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  SKY_CONFIG,
  type SkyConfig,
  type Star,
} from "@/features/constellation/config";
import { useConstellationEngine } from "@/features/constellation/hooks/use-constellation-engine";
import { useFirstView } from "@/features/constellation/hooks/use-first-view";
import { usePlayLayout } from "@/features/constellation/hooks/use-play-layout";
import { useSkyAudio } from "@/features/constellation/hooks/use-sky-audio";
import { useSkyReplies } from "@/features/constellation/hooks/use-sky-replies";
import { useUnlockedStars } from "@/features/constellation/hooks/use-unlocked-stars";
import { completeSky } from "@/features/constellation/lib/complete-sky";
import {
  type FieldCamera,
  starsFromReplies,
} from "@/features/constellation/lib/field";
import {
  hasPendingChallenge,
  isGateBroken,
  requirementsMet,
  type ResolvedGate,
  resolveGate,
  starImageUrl,
} from "@/features/constellation/lib/gates";
import { edgesOf } from "@/features/constellation/lib/sky";
import { attachSkyPan } from "@/features/constellation/lib/sky-pan";

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
  /** Hide the title, progress, and controls — used on the builder board. */
  quiet?: boolean;
  /** fileId → presigned URL, for gate photos (jigsaw). Merged builder previews
   * flow through here too so an uploaded image shows before it's saved. */
  assets?: Record<string, string>;
  /** Creation id or share token. Unsaved previews fall back to the sky id. */
  progressKey?: string;
  /** Public share token, so a recipient can leave a star. */
  shareToken?: string;
  /** Owner's creation id, so their sky can show the stars people left. */
  creationId?: string;
  /** When set, the host owns the camera (the builder board). */
  viewCamera?: FieldCamera | null;
};

function placeLabel(stars: Star[], camera: FieldCamera): string {
  let best: Star | null = null;
  let bestDist = 22;
  for (const star of stars) {
    if (star.reply) continue;
    const dist = Math.hypot(star.x - camera.x, star.y - camera.y);
    if (dist < bestDist) {
      best = star;
      bestDist = dist;
    }
  }
  if (!best) return "";
  if (best.stretch?.trim()) return best.stretch.trim();
  if (best.timestamp) {
    const d = new Date(best.timestamp);
    if (!Number.isNaN(d.getTime())) {
      return d.toLocaleDateString(undefined, {
        month: "long",
        year: "numeric",
      });
    }
  }
  return "";
}

export function ConstellationExperience({
  config: incoming = SKY_CONFIG,
  preview = false,
  quiet = false,
  assets = {},
  progressKey,
  shareToken,
  creationId,
  viewCamera = null,
}: ConstellationExperienceProps) {
  // A converted sky can omit sound, tour, and the finale. Fill those before
  // any hook reads them.
  const base = useMemo(() => completeSky(incoming), [incoming]);
  const storageKey = progressKey || base.id;
  const play = usePlayLayout(storageKey, !preview);
  const { apply: applyPlay } = play;
  const { lines, leave } = useSkyReplies({
    creationId,
    shareToken,
    storageKey,
    enabled: !preview,
  });
  const config = useMemo(() => {
    const placed = applyPlay(base.stars);
    const withReplies = [...placed, ...starsFromReplies(lines, placed)];
    return { ...base, stars: applyPlay(withReplies) };
  }, [base, applyPlay, lines]);
  // Which stars this viewer has already cleared (persisted per sky). A cleared
  // star never re-challenges unless it asks every visit, and it satisfies the
  // `requires` trail for later ones.
  const { cleared, markCleared } = useUnlockedStars(storageKey);

  // May the cinematic tour auto-open this star? Not if it's still blocked by an
  // unmet requirement or hidden behind an unsolved challenge.
  const canOpen = useCallback(
    (id: number) => {
      const star = config.stars.find((s) => s.id === id);
      if (!star) return false;
      if (isGateBroken(star)) return false;
      if (!requirementsMet(star, cleared)) return false;
      return (cleared.has(id) && !star.alwaysAsk) || !hasPendingChallenge(star);
    },
    [config.stars, cleared],
  );

  const rememberedIds = useMemo(() => {
    const ids = new Set<number>();
    for (const star of config.stars) {
      if (cleared.has(star.id) && !star.alwaysAsk) ids.add(star.id);
    }
    return ids;
  }, [config.stars, cleared]);

  const { isFirstView, markViewed } = useFirstView(storageKey);

  const songUrl = base.sound.song?.fileId
    ? assets[base.sound.song.fileId]
    : undefined;

  const engine = useConstellationEngine(config, {
    onOpen: markCleared,
    canOpen,
    rememberedIds,
    viewCamera,
    assets,
    focusNewest: !preview && isFirstView === false,
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
    camera,
    panBy,
    shaping,
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
      if (isGateBroken(star)) {
        setLockedHint(star);
        return;
      }
      if ((cleared.has(id) && !star.alwaysAsk) || !hasPendingChallenge(star)) {
        openStar(id);
        return;
      }
      const gate = resolveGate(star, assets);
      if (!gate) return;
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
      if (cleared.has(star.id) && !star.alwaysAsk) continue;
      if (!requirementsMet(star, cleared)) blocked.add(star.id);
      else if (hasPendingChallenge(star) || isGateBroken(star))
        gated.add(star.id);
    }
    return { blockedIds: blocked, gatedIds: gated };
  }, [config.stars, cleared]);

  const here = placeLabel(config.stars, camera);
  const skyRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ x: number; y: number; moved: boolean } | null>(null);
  const suspendDragRef = useRef(false);
  const gestureEpoch = useRef(0);
  const [wishHint, setWishHint] = useState(false);
  const [replyOpen, setReplyOpen] = useState(false);
  const [replyLine, setReplyLine] = useState("");
  const [replyName, setReplyName] = useState("");
  const [replyBusy, setReplyBusy] = useState(false);
  const authoredOpened = useMemo(() => {
    let count = 0;
    for (const star of config.stars) {
      if (!star.reply && openedIds.has(star.id)) count += 1;
    }
    return count;
  }, [config.stars, openedIds]);
  const { muted, unlock, toggleMuted } = useSkyAudio(
    base.sound,
    authoredOpened,
    total,
    songUrl,
  );

  useEffect(() => {
    if (preview || quiet || !base.wish?.message || !storageKey) return;
    const key = `kyndl:constellation-wish-hint:${storageKey}`;
    if (window.localStorage.getItem(key)) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- show the wish hint once, then hide it
    setWishHint(true);
    window.localStorage.setItem(key, "1");
    const timer = window.setTimeout(() => setWishHint(false), 6400);
    return () => window.clearTimeout(timer);
  }, [preview, quiet, base.wish?.message, storageKey]);

  useEffect(() => {
    const el = skyRef.current;
    if (!el || viewCamera != null) return;
    return attachSkyPan(el, panBy, (two) => {
      suspendDragRef.current = two;
      if (two) {
        gestureEpoch.current += 1;
        dragRef.current = null;
      }
    });
  }, [panBy, viewCamera]);

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

  const showGate = !preview && !quiet && isFirstView === true && !started;
  const interactive = started && !touring;
  const titleVisible = !quiet && (entered || reduceMotion) && !touring;

  return (
    <div
      ref={skyRef}
      className="relative h-full w-full touch-none select-none"
      onPointerDown={(e) => {
        if (suspendDragRef.current) return;
        if ((e.target as HTMLElement).closest("button, input, textarea"))
          return;
        dragRef.current = { x: e.clientX, y: e.clientY, moved: false };
      }}
      onPointerMove={(e) => {
        if (suspendDragRef.current) {
          dragRef.current = null;
          return;
        }
        const drag = dragRef.current;
        if (!drag || viewCamera != null) return;
        const dx = e.clientX - drag.x;
        const dy = e.clientY - drag.y;
        if (Math.hypot(dx, dy) > 4) drag.moved = true;
        if (drag.moved) {
          panBy(
            dx,
            dy,
            e.currentTarget.clientWidth,
            e.currentTarget.clientHeight,
          );
        }
        drag.x = e.clientX;
        drag.y = e.clientY;
      }}
      onPointerUp={(e) => {
        const drag = dragRef.current;
        dragRef.current = null;
        if (drag?.moved) return;
        if (interactive) tryCatchWish(e.clientX, e.clientY);
      }}
      onPointerLeave={() => {
        dragRef.current = null;
      }}
    >
      <ConstellationCanvas canvasRef={canvasRef} />

      <ConstellationHitLayer
        stars={config.stars}
        camera={camera}
        openedIds={openedIds}
        hoveredId={hoveredId}
        activeId={activeId}
        blockedIds={blockedIds}
        gatedIds={gatedIds}
        reduceMotion={reduceMotion}
        interactive={interactive && !shaping}
        onHover={setHoveredId}
        onOpen={handleOpen}
        onMoveStar={preview || shaping ? undefined : play.moveStar}
        gestureEpoch={gestureEpoch}
      />

      {/* constellation name, once the sky has assembled (hidden during the tour) */}
      <motion.header
        className="pointer-events-none absolute inset-x-0 top-0 flex flex-col items-center px-6 pt-[max(2rem,env(safe-area-inset-top))] text-center"
        initial={false}
        animate={{ opacity: titleVisible ? 1 : 0, y: titleVisible ? 0 : -8 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
      >
        <h1 className="font-serif text-2xl tracking-wide text-[#f2f4f8] sm:text-3xl [text-shadow:0_2px_18px_rgba(0,0,0,0.85)]">
          {config.constellationName}
        </h1>
        <p className="font-serif mt-1 text-sm text-[#9aa3b5] [text-shadow:0_1px_10px_rgba(0,0,0,0.85)]">
          {config.subtitle}
        </p>
        {here ? (
          <p className="mt-3 text-[11px] tracking-[0.28em] text-[#c4cad8] uppercase">
            {here}
          </p>
        ) : null}
      </motion.header>

      {wishHint && !quiet ? (
        <p className="pointer-events-none absolute inset-x-0 top-[22%] px-8 text-center font-serif text-sm text-[#d7deee] [text-shadow:0_1px_10px_rgba(0,0,0,0.9)]">
          A star sometimes falls — catch it.
        </p>
      ) : null}

      {/* closing line, once every authored star is read */}
      <div
        className={`pointer-events-none absolute inset-x-0 bottom-[14%] flex flex-col items-center px-6 text-center ${quiet ? "hidden" : ""}`}
      >
        <AnimatePresence>
          {allOpened && config.allStarsOpenedMessage ? (
            <motion.p
              key="finale"
              className="font-serif max-w-md text-base leading-relaxed text-[#e8ecf4] [text-shadow:0_1px_12px_rgba(0,0,0,0.85)]"
              initial={reduceMotion ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
            >
              {config.allStarsOpenedMessage}
            </motion.p>
          ) : null}
        </AnimatePresence>
      </div>

      {started && entered && !quiet ? (
        <ConstellationControls
          tourEnabled={config.tour.enabled}
          touring={touring}
          tourPaused={tourPaused}
          onPlay={startTour}
          onPause={pauseTour}
          onResume={resumeTour}
          onExplore={stopTour}
          soundEnabled={base.sound.enabled}
          muted={muted}
          onToggleMute={toggleMuted}
          onRearrange={
            preview
              ? undefined
              : () => play.rearrange(base.stars, edgesOf(base))
          }
          onReset={play.dirty ? play.reset : undefined}
        />
      ) : null}

      {leave && started && entered && !quiet && !preview ? (
        <div className="absolute bottom-[max(1rem,env(safe-area-inset-bottom))] left-4 z-50 max-w-xs">
          {replyOpen ? (
            <form
              className="rounded-2xl bg-black/55 p-3 text-[#f2f4f8] backdrop-blur-sm"
              onSubmit={(e) => {
                e.preventDefault();
                if (!replyLine.trim() || replyBusy) return;
                setReplyBusy(true);
                void leave(replyLine, replyName)
                  .then(() => {
                    setReplyLine("");
                    setReplyOpen(false);
                  })
                  .finally(() => setReplyBusy(false));
              }}
            >
              <p className="font-serif mb-2 text-sm">
                Leave a star in their sky
              </p>
              <input
                value={replyName}
                onChange={(e) => setReplyName(e.target.value)}
                placeholder="Your name"
                className="mb-2 w-full bg-transparent text-sm outline-none placeholder:text-[#8b93a8]"
              />
              <textarea
                value={replyLine}
                onChange={(e) => setReplyLine(e.target.value)}
                placeholder="One line"
                rows={2}
                maxLength={280}
                className="w-full resize-none bg-transparent text-sm outline-none placeholder:text-[#8b93a8]"
              />
              <div className="mt-2 flex justify-end gap-3 text-xs tracking-wide">
                <button type="button" onClick={() => setReplyOpen(false)}>
                  Cancel
                </button>
                <button type="submit" disabled={replyBusy || !replyLine.trim()}>
                  Leave it
                </button>
              </div>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => setReplyOpen(true)}
              className="font-serif text-sm text-[#d7deee] [text-shadow:0_1px_8px_rgba(0,0,0,0.9)]"
            >
              Leave a star
            </button>
          )}
        </div>
      ) : null}

      {/* the opened memory */}
      <AnimatePresence>
        {activeStar ? (
          <MemoryCard
            key={activeStar.id}
            star={activeStar}
            imageUrl={starImageUrl(activeStar, assets)}
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
            <span className="font-serif rounded-full bg-black/70 px-5 py-2.5 text-sm text-[#e8ecf4] backdrop-blur-sm [text-shadow:0_1px_8px_rgba(0,0,0,0.8)]">
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
              className="font-serif relative max-w-sm text-center text-lg leading-relaxed text-[#f0f2f7] [text-shadow:0_1px_14px_rgba(0,0,0,0.9)]"
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
                className="mt-6 block w-full text-xs tracking-[0.2em] text-[#a8b0c4] uppercase outline-none focus-visible:text-[#f0f2f7]"
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
