import {
  ChevronLeft,
  ChevronRight,
  Footprints,
  Lock,
  Sparkles,
} from "lucide-react";

import { nodeTitle } from "../../lib/node-visuals";
import { isNodeLocked, missingRequires, useMemoryCityStore } from "../../store";
import type { CityConfig } from "../../types";

/**
 * Bottom navigator for revolve / roam, with prerequisite lock hints.
 */
export function TourControls({ city }: { city: CityConfig }) {
  const started = useMemoryCityStore((s) => s.started);
  const mode = useMemoryCityStore((s) => s.mode);
  const currentIndex = useMemoryCityStore((s) => s.currentIndex);
  const arrived = useMemoryCityStore((s) => s.arrived);
  const activeNodeId = useMemoryCityStore((s) => s.activeNodeId);
  const focus = useMemoryCityStore((s) => s.focus);
  const enterRoam = useMemoryCityStore((s) => s.enterRoam);
  const exitRoam = useMemoryCityStore((s) => s.exitRoam);
  const activate = useMemoryCityStore((s) => s.activate);
  const solved = useMemoryCityStore((s) => s.solved);
  const recalled = useMemoryCityStore((s) => s.recalled);
  const roamAllowed = useMemoryCityStore((s) => s.roamAllowed);

  if (!started || activeNodeId) return null;

  const last = city.nodes.length - 1;
  const node = city.nodes[currentIndex];
  const title = node ? nodeTitle(node) : "";
  const locked = node ? isNodeLocked(node, solved) : false;
  const missing = node ? missingRequires(node, recalled) : [];
  const prereqBlocked = missing.length > 0;
  const missingTitles = missing
    .map((id) => {
      const n = city.nodes.find((x) => x.id === id);
      return n ? nodeTitle(n) : id;
    })
    .filter(Boolean);

  if (mode === "roam") {
    return (
      <div className="pointer-events-none absolute inset-x-0 bottom-6 z-10 flex flex-col items-center gap-3">
        <p className="rounded-full bg-black/40 px-4 py-1.5 text-xs text-white/70 backdrop-blur-sm">
          WASD to walk · drag to look · E to recall a nearby memory
        </p>
        <button
          type="button"
          onClick={exitRoam}
          className="pointer-events-auto inline-flex h-11 items-center gap-2 rounded-full bg-[#7fd9ff] px-6 text-sm font-semibold text-[#0b0a1a] shadow-[0_0_24px_rgba(127,217,255,0.45)] transition-transform hover:scale-105"
        >
          Rejoin the tour
        </button>
      </div>
    );
  }

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-6 z-10 flex flex-col items-center gap-3">
      {node && (
        <p className="rounded-full bg-black/40 px-4 py-1.5 text-sm text-white/85 backdrop-blur-sm">
          {title}
        </p>
      )}
      {prereqBlocked && arrived && (
        <p className="max-w-sm rounded-full bg-black/50 px-4 py-1.5 text-center text-xs text-amber-200/90 backdrop-blur-sm">
          Locked until you recall: {missingTitles.join(", ")}
        </p>
      )}

      <div className="pointer-events-auto flex items-center gap-2">
        <button
          type="button"
          onClick={() => focus(Math.max(0, currentIndex - 1))}
          disabled={currentIndex <= 0}
          aria-label="Previous memory"
          className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-black/40 text-white/85 backdrop-blur-sm transition-colors hover:bg-black/60 disabled:cursor-not-allowed disabled:opacity-30"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        <button
          type="button"
          onClick={() => node && activate(node)}
          disabled={!arrived || prereqBlocked}
          className="inline-flex h-11 items-center gap-2 rounded-full bg-[#7fd9ff] px-5 text-sm font-semibold text-[#0b0a1a] shadow-[0_0_24px_rgba(127,217,255,0.45)] transition-all hover:scale-105 disabled:scale-100 disabled:opacity-40"
        >
          {locked || prereqBlocked ? (
            <>
              <Lock className="h-4 w-4" />
              Unlock
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Recall
            </>
          )}
        </button>

        {roamAllowed && (
          <button
            type="button"
            onClick={enterRoam}
            disabled={!arrived}
            aria-label="Step into the district"
            className="inline-flex h-11 items-center gap-2 rounded-full border border-white/15 bg-black/40 px-4 text-sm text-white/85 backdrop-blur-sm transition-colors hover:bg-black/60 disabled:opacity-30"
          >
            <Footprints className="h-4 w-4" />
            Step off
          </button>
        )}

        <button
          type="button"
          onClick={() => focus(Math.min(last, currentIndex + 1))}
          disabled={currentIndex >= last}
          aria-label="Next memory"
          className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-black/40 text-white/85 backdrop-blur-sm transition-colors hover:bg-black/60 disabled:cursor-not-allowed disabled:opacity-30"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
