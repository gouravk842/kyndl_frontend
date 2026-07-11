"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Lock } from "lucide-react";

import type { Star } from "@/features/constellation/config";

type ConstellationHitLayerProps = {
  stars: Star[];
  openedIds: Set<number>;
  hoveredId: number | null;
  activeId: number | null;
  /** Stars blocked by an unmet `requires` trail — dimmed, tap only nudges. */
  blockedIds: Set<number>;
  /** Stars hidden behind an unsolved challenge — a lock invites the tap. */
  gatedIds: Set<number>;
  reduceMotion: boolean;
  /** During the cinematic tour the stars are non-interactive (lean-back mode). */
  interactive: boolean;
  onHover: (id: number | null) => void;
  onOpen: (id: number) => void;
};

/**
 * The accessible interaction layer. The canvas can't be focused or read by a
 * screen reader, so every named star also gets a real `<button>` positioned
 * over its painted dot (by the same percent coordinates the canvas uses). This
 * is what users actually tap, hover, and tab through — the canvas just mirrors
 * the resulting state visually.
 *
 * Each button carries only a generous invisible tap target; on hover or focus
 * it reveals the star's label so the sky stays uncluttered until explored.
 */
export function ConstellationHitLayer({
  stars,
  openedIds,
  hoveredId,
  activeId,
  blockedIds,
  gatedIds,
  reduceMotion,
  interactive,
  onHover,
  onOpen,
}: ConstellationHitLayerProps) {
  return (
    // The container is click-through so empty-sky taps fall to the wish-catch
    // layer below; only the star buttons re-enable pointer events.
    <div
      className="absolute inset-0 transition-opacity duration-500"
      style={{
        pointerEvents: "none",
        opacity: interactive ? 1 : 0,
      }}
      aria-hidden={!interactive}
    >
      {stars.map((star) => {
        const opened = openedIds.has(star.id);
        const blocked = blockedIds.has(star.id);
        const gated = gatedIds.has(star.id);
        const locked = blocked || gated;
        const revealed = hoveredId === star.id || activeId === star.id;
        const ariaLabel = blocked
          ? `${star.label}. Locked — read the earlier stars first.`
          : gated
            ? `${star.label}. Locked — tap to solve its challenge.`
            : `${star.label}${opened ? " — opened" : ""}. ${star.date}. Open this memory.`;
        return (
          <button
            key={star.id}
            type="button"
            onMouseEnter={() => onHover(star.id)}
            onMouseLeave={() => onHover(null)}
            onFocus={() => onHover(star.id)}
            onBlur={() => onHover(null)}
            onClick={() => onOpen(star.id)}
            tabIndex={interactive ? 0 : -1}
            aria-label={ariaLabel}
            className="group absolute flex -translate-x-1/2 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full outline-none"
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              // generous, finger-friendly hit area centred on the painted star
              width: "44px",
              height: "44px",
              opacity: blocked ? 0.55 : 1,
              pointerEvents: interactive ? "auto" : "none",
            }}
          >
            {/* keyboard focus ring — the painted star handles the visuals */}
            <span
              aria-hidden
              className="absolute h-7 w-7 rounded-full transition-shadow group-focus-visible:shadow-[0_0_0_2px_rgba(255,240,200,0.7)]"
            />

            {/* a small padlock over a still-locked star, so the gate reads at a glance */}
            {locked ? (
              <span
                aria-hidden
                className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-black/55 text-[#e9e2f4] backdrop-blur-sm"
              >
                <Lock className="h-2.5 w-2.5" />
              </span>
            ) : null}
            <AnimatePresence>
              {revealed ? (
                <motion.span
                  aria-hidden
                  className="font-serif pointer-events-none absolute top-7 whitespace-nowrap text-sm tracking-wide text-[#f3ead2] [text-shadow:0_1px_8px_rgba(0,0,0,0.8)]"
                  initial={reduceMotion ? false : { opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.2 }}
                >
                  {star.label}
                </motion.span>
              ) : null}
            </AnimatePresence>
          </button>
        );
      })}
    </div>
  );
}
