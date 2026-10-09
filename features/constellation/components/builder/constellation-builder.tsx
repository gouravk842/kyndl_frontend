"use client";

import { RefreshCw, X } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { useConstellationSync } from "@/hooks/use-constellation-sync";

import type { Star } from "../../config";
import {
  cameraHome,
  clampCamera,
  type FieldCamera,
  screenOf,
  worldFromClient,
} from "../../lib/field";
import { attachSkyPan } from "../../lib/sky-pan";
import { useBuilderStore } from "../../store/builder.store";
import { ConstellationExperience } from "../constellation-experience";
import { BuilderPanel } from "./builder-panel";

const SIZE_PX: Record<Star["size"], number> = {
  small: 7,
  medium: 11,
  large: 16,
};

/**
 * The Constellation customization panel: an editor rail beside a deep-black
 * sky board. Stars sit in a loose field. Drag saves a place. Rearrange only
 * suggests a fresh scatter.
 */
export function ConstellationBuilder() {
  const sync = useConstellationSync();
  const doc = useBuilderStore((s) => s.doc);
  const selectedId = useBuilderStore((s) => s.selectedId);
  const selectStar = useBuilderStore((s) => s.selectStar);
  const setStarPosition = useBuilderStore((s) => s.setStarPosition);
  const rearrangeSky = useBuilderStore((s) => s.rearrangeSky);
  const assets = useBuilderStore((s) => s.assets);
  const localPreviews = useBuilderStore((s) => s.localPreviews);
  const previewAssets = { ...assets, ...localPreviews };
  const params = useSearchParams();

  const boardRef = useRef<HTMLDivElement>(null);
  const draggingId = useRef<number | null>(null);
  const panning = useRef<{ x: number; y: number } | null>(null);
  const multiTouch = useRef(false);
  const [previewing, setPreviewing] = useState(false);
  const [boardCamera, setBoardCamera] = useState<FieldCamera | null>(null);
  const camera = boardCamera ?? cameraHome(doc.stars, false);

  // A fresh `?new=constellation` must not reopen the last persisted draft.
  const wiped = useRef(false);
  useEffect(() => {
    if (params.get("new") !== "constellation" || params.get("id")) return;
    const reset = () => {
      if (wiped.current) return;
      wiped.current = true;
      useBuilderStore.getState().reset();
      setBoardCamera(null);
    };
    if (useBuilderStore.persist.hasHydrated()) reset();
    return useBuilderStore.persist.onFinishHydration(reset);
  }, [params]);

  useEffect(() => {
    const el = boardRef.current;
    if (!el) return;
    return attachSkyPan(
      el,
      (dx, dy, width, height) => {
        if (width <= 0 || height <= 0) return;
        const stars = useBuilderStore.getState().doc.stars;
        setBoardCamera((cur) =>
          clampCamera(
            {
              x: (cur ?? cameraHome(stars, false)).x - (dx / width) * 100,
              y: (cur ?? cameraHome(stars, false)).y - (dy / height) * 100,
            },
            stars,
          ),
        );
      },
      (two) => {
        multiTouch.current = two;
        if (two) {
          draggingId.current = null;
          panning.current = null;
        }
      },
    );
  }, []);

  function moveFromPointer(clientX: number, clientY: number) {
    const id = draggingId.current;
    const board = boardRef.current;
    if (id == null || !board) return;
    const rect = board.getBoundingClientRect();
    const at = worldFromClient(clientX, clientY, rect, camera);
    setStarPosition(id, at.x, at.y);
  }

  return (
    <div className="flex h-[calc(100dvh-4rem)] w-full flex-col-reverse sm:flex-row">
      <BuilderPanel
        sync={sync}
        onPreview={() => setPreviewing(true)}
        className="h-1/2 w-full shrink-0 border-t sm:h-full sm:w-[380px] sm:border-t-0 sm:border-r"
      />

      <div
        ref={boardRef}
        className="relative h-1/2 flex-1 touch-none overflow-hidden sm:h-full"
        style={{
          background:
            "radial-gradient(ellipse 80% 55% at 50% 28%, #141820 0%, #05070e 55%, #020308 100%)",
        }}
        onPointerDown={(e) => {
          if (multiTouch.current) return;
          if ((e.target as HTMLElement).closest("button")) return;
          panning.current = { x: e.clientX, y: e.clientY };
        }}
        onPointerMove={(e) => {
          if (multiTouch.current) {
            draggingId.current = null;
            panning.current = null;
            return;
          }
          if (draggingId.current != null) {
            moveFromPointer(e.clientX, e.clientY);
            return;
          }
          if (!panning.current) return;
          const dx = e.clientX - panning.current.x;
          const dy = e.clientY - panning.current.y;
          panning.current = { x: e.clientX, y: e.clientY };
          const width = boardRef.current?.clientWidth || 1;
          const height = boardRef.current?.clientHeight || 1;
          setBoardCamera((cur) =>
            clampCamera(
              {
                x: (cur ?? camera).x - (dx / width) * 100,
                y: (cur ?? camera).y - (dy / height) * 100,
              },
              doc.stars,
            ),
          );
        }}
        onPointerUp={() => {
          draggingId.current = null;
          panning.current = null;
        }}
        onPointerLeave={() => {
          draggingId.current = null;
          panning.current = null;
        }}
      >
        <div className="pointer-events-none absolute inset-0">
          <ConstellationExperience
            config={doc}
            assets={previewAssets}
            preview
            quiet
            viewCamera={camera}
            creationId={sync.creationId ?? undefined}
            progressKey={sync.creationId ?? undefined}
          />
        </div>
        {/* faint ground band so the board matches the live sky framing */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-[10%]"
          style={{
            background:
              "linear-gradient(180deg, transparent 0%, #010204 35%, #000 100%)",
          }}
        />

        {doc.stars.map((star) => {
          const { left, top } = screenOf(star, camera);
          if (left < -8 || left > 108 || top < -12 || top > 108) return null;
          const px = SIZE_PX[star.size];
          const active = star.id === selectedId;
          return (
            <button
              key={star.id}
              type="button"
              aria-label={`Position ${star.label || "star"}`}
              onPointerDown={(e) => {
                if (multiTouch.current) return;
                e.preventDefault();
                draggingId.current = star.id;
                selectStar(star.id);
              }}
              className="absolute -translate-x-1/2 -translate-y-1/2 cursor-grab rounded-full outline-none transition-[left,top,box-shadow] duration-500 ease-out active:cursor-grabbing"
              style={{
                left: `${left}%`,
                top: `${top}%`,
                width: px,
                height: px,
                background: "#f7f8fc",
                boxShadow: active
                  ? "0 0 0 2px rgba(255,255,255,0.55), 0 0 18px 5px rgba(220,230,255,0.75)"
                  : "0 0 12px 3px rgba(220,230,255,0.55)",
              }}
            >
              <span className="pointer-events-none absolute left-1/2 top-full mt-1.5 -translate-x-1/2 whitespace-nowrap text-[10px] tracking-wide text-[#c4cad8]">
                {star.label}
              </span>
            </button>
          );
        })}

        {doc.stars.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="font-serif text-lg text-[#9aa3b5]">
              Add a star to begin your sky.
            </p>
          </div>
        )}

        {doc.stars.length > 0 && (
          <button
            type="button"
            onClick={rearrangeSky}
            className="absolute right-3 bottom-3 z-10 inline-flex items-center gap-1.5 rounded-full bg-white/8 px-3.5 py-2 text-[11px] font-medium tracking-[0.14em] text-[#e4e8f0] uppercase backdrop-blur-sm transition-colors hover:bg-white/14"
          >
            <RefreshCw className="size-3" /> Rearrange
          </button>
        )}
      </div>

      {previewing && (
        <div className="fixed inset-0 z-[80] bg-black">
          <ConstellationExperience
            key={previewing ? "on" : "off"}
            config={doc}
            assets={previewAssets}
            preview
            creationId={sync.creationId ?? undefined}
            progressKey={sync.creationId ?? undefined}
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
