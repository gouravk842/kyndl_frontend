"use client";

import { type QueryKey, useQueryClient } from "@tanstack/react-query";
import { useEffect, useEffectEvent, useRef } from "react";

import type { CreationAsset } from "@/types/creation";

/** Fraction of the signed-URL lifetime after which we refresh. */
const REFRESH_AT_FRACTION = 0.8;
/** Never schedule a refresh sooner than this (avoids hammering on tiny TTLs). */
const MIN_REFRESH_DELAY_MS = 30_000;
/** Cap so a misconfigured huge TTL still refreshes within a session. */
const MAX_REFRESH_DELAY_MS = 6 * 60 * 60 * 1000;

/**
 * Shortest `expires_in` (seconds) across an assets map, or `null` when unknown.
 * Used to schedule a silent re-fetch before S3/MinIO signatures die.
 */
export function minAssetExpiresIn(
  assets: Record<string, CreationAsset> | undefined | null,
): number | null {
  if (!assets) return null;
  let min = Infinity;
  for (const asset of Object.values(assets)) {
    if (typeof asset?.expires_in === "number" && asset.expires_in > 0) {
      min = Math.min(min, asset.expires_in);
    }
  }
  return Number.isFinite(min) ? min : null;
}

function refreshDelayMs(expiresInSeconds: number): number {
  const target = Math.floor(expiresInSeconds * REFRESH_AT_FRACTION * 1000);
  return Math.min(MAX_REFRESH_DELAY_MS, Math.max(MIN_REFRESH_DELAY_MS, target));
}

/**
 * Keep React Query caches that embed presigned media URLs fresh.
 *
 * - Refetches when the tab becomes visible again (incl. bfcache `pageshow`)
 * - Schedules a background invalidate before the shortest `expires_in` elapses
 *
 * Callers should enable `refetchOnWindowFocus` on the query as a belt-and-suspenders
 * for environments that deliver focus without a visibility flip.
 */
export function usePresignedAssetRefresh(
  queryKey: QueryKey,
  expiresInSeconds: number | null | undefined,
  enabled = true,
): void {
  const queryClient = useQueryClient();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const invalidate = useEffectEvent(() => {
    if (!enabled) return;
    void queryClient.invalidateQueries({ queryKey });
  });

  // Visibility / bfcache: user came back to a tab that may hold dead signatures.
  useEffect(() => {
    if (!enabled) return;

    const onVisibility = () => {
      if (document.visibilityState === "visible") invalidate();
    };
    const onPageShow = (event: PageTransitionEvent) => {
      // bfcache restore rehydrates the JS heap without remounting — force refresh.
      if (event.persisted) invalidate();
    };

    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pageshow", onPageShow);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pageshow", onPageShow);
    };
  }, [enabled]);

  // Timer: refresh before the signed URLs expire, without clearing rendered data.
  useEffect(() => {
    if (!enabled || expiresInSeconds == null || expiresInSeconds <= 0) return;

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      invalidate();
    }, refreshDelayMs(expiresInSeconds));

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [enabled, expiresInSeconds]);
}
