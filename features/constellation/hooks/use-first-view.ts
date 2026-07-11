"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * Has this sky been opened on this device before? Drives the one-time first-view
 * ceremony: the dramatic entrance plays only the first time, then every later
 * visit settles straight into the calm keepsake version.
 *
 * Backed by `localStorage` (device-scoped) for now. Phase 4 upgrades this to a
 * server record so the giver can witness the real, true first open. We read it
 * via `useSyncExternalStore` so the server snapshot is `null` ("unknown") and
 * the client resolves the real value after hydration — no flash, no mismatch.
 */
const KEY = (id: string) => `kyndl:constellation:${id}:firstViewedAt`;

const listeners = new Set<() => void>();
function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function useFirstView(skyId: string) {
  const isFirstView = useSyncExternalStore<boolean | null>(
    subscribe,
    () => {
      try {
        return window.localStorage.getItem(KEY(skyId)) === null;
      } catch {
        return true; // storage blocked — treat as first view
      }
    },
    () => null, // server / hydration snapshot: unknown
  );

  const markViewed = useCallback(() => {
    try {
      window.localStorage.setItem(KEY(skyId), new Date().toISOString());
    } catch {
      // storage blocked — ceremony just replays next time; harmless
    }
    listeners.forEach((l) => l());
  }, [skyId]);

  return { isFirstView, markViewed };
}
