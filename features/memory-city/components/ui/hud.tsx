import { ArrowLeft, Volume2, VolumeX } from "lucide-react";
import Link from "next/link";

import { ROUTES } from "@/constants/routes";

import { useMemoryCityStore } from "../../store";
import type { CityConfig } from "../../types";

/**
 * Heads-up display: leave link, a recall-progress counter, and a mute toggle.
 * Hidden until the recipient has entered.
 */
export function Hud({ city }: { city: CityConfig }) {
  const started = useMemoryCityStore((s) => s.started);
  const muted = useMemoryCityStore((s) => s.muted);
  const toggleMuted = useMemoryCityStore((s) => s.toggleMuted);
  const recalledCount = useMemoryCityStore((s) => s.recalled.size);

  if (!started) return null;

  return (
    <div className="pointer-events-none absolute top-4 right-4 left-4 z-10 flex items-center justify-between">
      <Link
        href={ROUTES.home}
        className="pointer-events-auto inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-black/35 px-3 py-1.5 text-xs text-white/80 backdrop-blur-sm transition-colors hover:bg-black/55 hover:text-white"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Leave the city
      </Link>

      <div className="flex items-center gap-3">
        <span className="rounded-full border border-white/15 bg-black/35 px-3 py-1.5 text-xs text-white/80 backdrop-blur-sm">
          {recalledCount} / {city.nodes.length} recalled
        </span>
        <button
          type="button"
          onClick={toggleMuted}
          aria-label={muted ? "Unmute ambient sound" : "Mute ambient sound"}
          aria-pressed={muted}
          className="pointer-events-auto flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-black/35 text-white/80 backdrop-blur-sm transition-colors hover:bg-black/55 hover:text-white"
        >
          {muted ? (
            <VolumeX className="h-4 w-4" />
          ) : (
            <Volume2 className="h-4 w-4" />
          )}
        </button>
      </div>
    </div>
  );
}
