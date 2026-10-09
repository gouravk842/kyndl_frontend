"use client";

import { Minus, Plus } from "lucide-react";

import {
  clampZoom,
  ZOOM_MAX,
  ZOOM_MIN,
  ZOOM_STEP,
} from "@/features/memory-bank/lib/solar-zoom";
import { cn } from "@/lib/utils";

export function ZoomControls({
  zoom,
  onChange,
  className,
}: {
  zoom: number;
  onChange: (zoom: number) => void;
  className?: string;
}) {
  return (
    <div
      data-hud
      role="group"
      aria-label="Map size"
      className={cn(
        "absolute bottom-6 left-4 z-20 hidden items-center gap-1 rounded-full border border-[var(--mb-solar-line)] bg-[var(--mb-solar-void)]/95 p-1 shadow-sm md:flex",
        className,
      )}
    >
      <button
        type="button"
        className="flex size-11 items-center justify-center rounded-full text-[var(--mb-solar-ink)] hover:bg-black/5 disabled:opacity-40"
        aria-label="Reduce map"
        disabled={zoom <= ZOOM_MIN}
        onClick={() => onChange(clampZoom(zoom - ZOOM_STEP))}
      >
        <Minus className="size-4" />
      </button>
      <button
        type="button"
        className="flex size-11 items-center justify-center rounded-full text-[var(--mb-solar-ink)] hover:bg-black/5 disabled:opacity-40"
        aria-label="Enlarge map"
        disabled={zoom >= ZOOM_MAX}
        onClick={() => onChange(clampZoom(zoom + ZOOM_STEP))}
      >
        <Plus className="size-4" />
      </button>
    </div>
  );
}
