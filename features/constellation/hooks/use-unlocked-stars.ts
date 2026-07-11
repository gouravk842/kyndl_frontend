"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * Which stars in this sky have had their gate cleared on this device.
 *
 * Once a viewer answers a question or solves a jigsaw, that star stays open on
 * return visits — no re-solving the same puzzle — and it counts toward the
 * `requires` "sequential trail" that unblocks later stars. Device-scoped via
 * `localStorage`, keyed by sky id, mirroring `useFirstView`.
 *
 * The set is read through `useSyncExternalStore` so the server/hydration
 * snapshot is empty and the real value resolves after hydration — no flash of
 * wrongly-locked stars. A single shared listener set means every mounted reader
 * re-renders the instant a star is marked cleared.
 */
const KEY = (id: string) => `kyndl:constellation:${id}:unlocked`;

const EMPTY: ReadonlySet<number> = new Set();

const listeners = new Set<() => void>();
function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

function read(skyId: string): number[] {
  try {
    const raw = window.localStorage.getItem(KEY(skyId));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((n): n is number => typeof n === "number")
      : [];
  } catch {
    return [];
  }
}

// Cache the derived Set per (skyId, serialised ids) so the snapshot identity is
// stable between renders — useSyncExternalStore requires a stable snapshot or it
// loops. The key folds in the raw string so a write produces a fresh Set.
let cacheKey = "";
let cacheSet: ReadonlySet<number> = EMPTY;

export function useUnlockedStars(skyId: string) {
  const cleared = useSyncExternalStore<ReadonlySet<number>>(
    subscribe,
    () => {
      const ids = read(skyId);
      const key = `${skyId}:${ids.join(",")}`;
      if (key !== cacheKey) {
        cacheKey = key;
        cacheSet = new Set(ids);
      }
      return cacheSet;
    },
    () => EMPTY, // server / hydration snapshot: nothing cleared yet
  );

  const markCleared = useCallback(
    (id: number) => {
      try {
        const ids = read(skyId);
        if (!ids.includes(id)) {
          window.localStorage.setItem(KEY(skyId), JSON.stringify([...ids, id]));
        }
      } catch {
        // storage blocked — the gate simply re-challenges next visit; harmless
      }
      listeners.forEach((l) => l());
    },
    [skyId],
  );

  return { cleared, markCleared };
}
