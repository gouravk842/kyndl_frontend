"use client";

import { useSyncExternalStore } from "react";

/** DOM id on `RecipientAftermath` — Make yours hides when this enters view. */
export const RECIPIENT_AFTERMATH_ID = "kyndl-recipient-aftermath";

/**
 * Tiny pub/sub for experience chrome that owns the bottom of `/v/<token>`
 * (e.g. Timeless Treasure’s transport bar). The shared Make yours FAB listens
 * so it can yield the corner on small screens instead of stacking on top.
 */
let claimed = false;
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

export function setPublicBottomChrome(next: boolean) {
  if (claimed === next) return;
  claimed = next;
  emit();
}

export function usePublicBottomChrome() {
  return useSyncExternalStore(
    (onStoreChange) => {
      listeners.add(onStoreChange);
      return () => {
        listeners.delete(onStoreChange);
      };
    },
    () => claimed,
    () => false,
  );
}
