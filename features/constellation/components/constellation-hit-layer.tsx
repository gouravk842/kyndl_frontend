"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Lock } from "lucide-react";
import { type RefObject, useRef } from "react";

import type { Star } from "@/features/constellation/config";
import {
  type FieldCamera,
  fieldPresence,
  PRESENCE_AWAKE,
  screenOf,
  worldFromClient,
} from "@/features/constellation/lib/field";

type ConstellationHitLayerProps = {
  stars: Star[];
  camera: FieldCamera;
  openedIds: Set<number>;
  hoveredId: number | null;
  activeId: number | null;
  blockedIds: Set<number>;
  gatedIds: Set<number>;
  reduceMotion: boolean;
  interactive: boolean;
  onHover: (id: number | null) => void;
  onOpen: (id: number) => void;
  /** Drag a star. Absent in the authoring board, which has its own handles. */
  onMoveStar?: (id: number, x: number, y: number) => void;
  /** Bumped when a second finger lands, so an in-progress drag is abandoned. */
  gestureEpoch?: RefObject<number>;
};

/**
 * The accessible interaction layer. Far stars sleep — they stay painted as
 * pricks, but they have no tap target until the camera brings them close.
 */
export function ConstellationHitLayer({
  stars,
  camera,
  openedIds,
  hoveredId,
  activeId,
  blockedIds,
  gatedIds,
  reduceMotion,
  interactive,
  onHover,
  onOpen,
  onMoveStar,
  gestureEpoch,
}: ConstellationHitLayerProps) {
  const layerRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{
    id: number;
    x: number;
    y: number;
    moved: boolean;
    epoch: number;
  } | null>(null);

  return (
    <div
      ref={layerRef}
      className="absolute inset-0 transition-opacity duration-500"
      style={{
        pointerEvents: "none",
        opacity: interactive ? 1 : 0,
      }}
      aria-hidden={!interactive}
    >
      {stars.map((star) => {
        const { left, top } = screenOf(star, camera);
        if (left < -8 || left > 108 || top < -8 || top > 108) return null;
        const opened = openedIds.has(star.id);
        const blocked = blockedIds.has(star.id);
        const gated = gatedIds.has(star.id);
        const locked = blocked || gated;
        const revealed = hoveredId === star.id || activeId === star.id;
        const presence = Math.max(
          fieldPresence(star, camera),
          revealed ? 1 : 0,
        );
        if (presence < PRESENCE_AWAKE && !revealed) return null;
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
            onPointerDown={(e) => {
              if (!onMoveStar) return;
              e.stopPropagation();
              e.currentTarget.setPointerCapture(e.pointerId);
              dragRef.current = {
                id: star.id,
                x: e.clientX,
                y: e.clientY,
                moved: false,
                epoch: gestureEpoch?.current ?? 0,
              };
            }}
            onPointerMove={(e) => {
              const drag = dragRef.current;
              const layer = layerRef.current;
              if (!drag || drag.id !== star.id || !layer || !onMoveStar) return;
              if (gestureEpoch && drag.epoch !== gestureEpoch.current) {
                dragRef.current = null;
                return;
              }
              if (Math.hypot(e.clientX - drag.x, e.clientY - drag.y) > 6)
                drag.moved = true;
              if (!drag.moved) return;
              const rect = layer.getBoundingClientRect();
              const at = worldFromClient(e.clientX, e.clientY, rect, camera);
              onMoveStar(drag.id, at.x, at.y);
            }}
            onPointerUp={() => {
              const drag = dragRef.current;
              if (!drag || drag.id !== star.id) return;
              dragRef.current = null;
              if (gestureEpoch && drag.epoch !== gestureEpoch.current) return;
              if (!drag.moved) onOpen(star.id);
            }}
            onPointerCancel={() => {
              if (dragRef.current?.id === star.id) dragRef.current = null;
            }}
            onClick={() => {
              if (onMoveStar) return;
              onOpen(star.id);
            }}
            tabIndex={interactive ? 0 : -1}
            aria-label={ariaLabel}
            className="group absolute flex -translate-x-1/2 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full outline-none"
            style={{
              left: `${left}%`,
              top: `${top}%`,
              width: "44px",
              height: "44px",
              opacity: (blocked ? 0.55 : 1) * presence,
              pointerEvents: interactive ? "auto" : "none",
            }}
          >
            <span
              aria-hidden
              className="absolute h-7 w-7 rounded-full transition-shadow group-focus-visible:shadow-[0_0_0_2px_rgba(255,240,200,0.7)]"
            />
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
                  className="font-serif pointer-events-none absolute top-7 whitespace-nowrap text-sm tracking-wide text-[#f0f2f7] [text-shadow:0_1px_8px_rgba(0,0,0,0.85)]"
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
