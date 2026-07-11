"use client";

import { X } from "lucide-react";
import { useRef, useState } from "react";

import { useConstellationSync } from "@/hooks/use-constellation-sync";

import type { Star } from "../../config";
import { useBuilderStore } from "../../store/builder.store";
import { ConstellationExperience } from "../constellation-experience";
import { BuilderPanel } from "./builder-panel";

const SIZE_PX: Record<Star["size"], number> = {
  small: 8,
  medium: 12,
  large: 18,
};

/** Clamp a star to a sensible on-screen band (matches the config guidance). */
const clampX = (x: number) => Math.min(92, Math.max(8, x));
const clampY = (y: number) => Math.min(88, Math.max(8, y));

/**
 * The Constellation customization panel: an editor rail beside a dark sky board
 * where every star sits at its `x/y` percentage and can be dragged to reposition.
 * The "Preview the sky" button mounts the real experience full-screen, fed the
 * live draft. Both halves drive the same builder store; the sync hook persists.
 */
export function ConstellationBuilder() {
  const sync = useConstellationSync();
  const doc = useBuilderStore((s) => s.doc);
  const selectedId = useBuilderStore((s) => s.selectedId);
  const selectStar = useBuilderStore((s) => s.selectStar);
  const setStarPosition = useBuilderStore((s) => s.setStarPosition);
  const assets = useBuilderStore((s) => s.assets);
  const localPreviews = useBuilderStore((s) => s.localPreviews);
  // Session uploads (object URLs) take precedence over saved presigned URLs, so
  // a just-added jigsaw photo shows in the preview before it's persisted.
  const previewAssets = { ...assets, ...localPreviews };

  const boardRef = useRef<HTMLDivElement>(null);
  const draggingId = useRef<number | null>(null);
  const [previewing, setPreviewing] = useState(false);

  // Connect stars in order (or by the saved custom shape) to hint the lines.
  const edges = doc.customEdges?.length
    ? doc.customEdges
    : doc.stars.slice(1).map((s, i) => [doc.stars[i]!.id, s.id] as const);
  const byId = new Map(doc.stars.map((s) => [s.id, s]));

  function moveFromPointer(clientX: number, clientY: number) {
    const id = draggingId.current;
    const board = boardRef.current;
    if (id == null || !board) return;
    const rect = board.getBoundingClientRect();
    const x = clampX(((clientX - rect.left) / rect.width) * 100);
    const y = clampY(((clientY - rect.top) / rect.height) * 100);
    setStarPosition(id, Math.round(x * 10) / 10, Math.round(y * 10) / 10);
  }

  return (
    <div className="flex h-[calc(100dvh-4rem)] w-full flex-col-reverse sm:flex-row">
      <BuilderPanel
        sync={sync}
        onPreview={() => setPreviewing(true)}
        className="h-1/2 w-full shrink-0 border-t sm:h-full sm:w-[380px] sm:border-t-0 sm:border-r"
      />

      {/* Star board — drag to position, click to select. */}
      <div
        ref={boardRef}
        className="relative h-1/2 flex-1 touch-none overflow-hidden sm:h-full"
        style={{
          background:
            "linear-gradient(180deg, #060f28 0%, #122146 55%, #2b3a5e 100%)",
        }}
        onPointerMove={(e) => {
          if (draggingId.current != null) moveFromPointer(e.clientX, e.clientY);
        }}
        onPointerUp={() => {
          draggingId.current = null;
        }}
        onPointerLeave={() => {
          draggingId.current = null;
        }}
      >
        {/* connecting lines */}
        <svg
          aria-hidden
          className="pointer-events-none absolute inset-0 h-full w-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          {edges.map(([a, b], i) => {
            const from = byId.get(a);
            const to = byId.get(b);
            if (!from || !to) return null;
            return (
              <line
                key={i}
                x1={from.x}
                y1={from.y}
                x2={to.x}
                y2={to.y}
                stroke="rgba(255,240,200,0.22)"
                strokeWidth="0.3"
                vectorEffect="non-scaling-stroke"
              />
            );
          })}
        </svg>

        {doc.stars.map((star) => {
          const px = SIZE_PX[star.size];
          const active = star.id === selectedId;
          return (
            <button
              key={star.id}
              type="button"
              aria-label={`Position ${star.label || "star"}`}
              onPointerDown={(e) => {
                e.preventDefault();
                draggingId.current = star.id;
                selectStar(star.id);
              }}
              className="absolute -translate-x-1/2 -translate-y-1/2 cursor-grab rounded-full outline-none active:cursor-grabbing"
              style={{
                left: `${star.x}%`,
                top: `${star.y}%`,
                width: px,
                height: px,
                background: "#fff7e0",
                boxShadow: active
                  ? "0 0 0 3px rgba(240,200,105,0.6), 0 0 16px 4px rgba(255,240,200,0.8)"
                  : "0 0 10px 2px rgba(255,240,200,0.6)",
              }}
            >
              <span className="pointer-events-none absolute left-1/2 top-full mt-1 -translate-x-1/2 whitespace-nowrap text-[10px] text-[#cdd6f4]">
                {star.label}
              </span>
            </button>
          );
        })}

        {doc.stars.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="font-serif text-lg text-[#b9b2d0]">
              Add a star to begin your sky.
            </p>
          </div>
        )}
      </div>

      {/* Full-screen live preview of the real experience. */}
      {previewing && (
        <div className="fixed inset-0 z-[80] bg-black">
          {/* key remounts the engine fresh from the current draft each open */}
          <ConstellationExperience
            key={previewing ? "on" : "off"}
            config={doc}
            assets={previewAssets}
            preview
          />
          <button
            type="button"
            onClick={() => setPreviewing(false)}
            aria-label="Close preview"
            className="absolute right-4 top-4 z-[81] inline-flex items-center gap-1.5 rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur transition-colors hover:bg-white/20"
          >
            <X className="size-4" /> Close preview
          </button>
        </div>
      )}
    </div>
  );
}
