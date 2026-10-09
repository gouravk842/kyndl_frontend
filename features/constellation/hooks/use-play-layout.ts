"use client";

import { useCallback, useEffect, useState } from "react";

import type { Star } from "@/features/constellation/config";
import {
  type FieldCamera,
  looseArrange,
} from "@/features/constellation/lib/field";

type Positions = Record<number, { x: number; y: number }>;

function storageKey(key: string) {
  return `kyndl:constellation-field:${key}`;
}

function readPositions(key: string): Positions {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(storageKey(key));
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Positions;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

/**
 * The recipient's arrangement, kept on this device only. The author's sky
 * stays as it was given; reset clears the local overlay.
 */
export function usePlayLayout(key: string | undefined, enabled: boolean) {
  const [positions, setPositions] = useState<Positions>({});

  useEffect(() => {
    if (!enabled || !key) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- drop a saved layout when play mode turns off
      setPositions({});
      return;
    }

    setPositions(readPositions(key));
  }, [enabled, key]);

  const write = useCallback(
    (next: Positions) => {
      setPositions(next);
      if (!key || typeof window === "undefined") return;
      if (Object.keys(next).length === 0) {
        window.localStorage.removeItem(storageKey(key));
        return;
      }
      window.localStorage.setItem(storageKey(key), JSON.stringify(next));
    },
    [key],
  );

  const apply = useCallback(
    (stars: Star[]): Star[] => {
      if (!enabled || Object.keys(positions).length === 0) return stars;
      return stars.map((star) => {
        const at = positions[star.id];
        return at ? { ...star, x: at.x, y: at.y } : star;
      });
    },
    [enabled, positions],
  );

  const moveStar = useCallback(
    (id: number, x: number, y: number) => {
      if (!enabled) return;
      write({ ...positions, [id]: { x, y } });
    },
    [enabled, positions, write],
  );

  const rearrange = useCallback(
    (stars: Star[], edges: [number, number][]) => {
      if (!enabled) return;
      const next: Positions = { ...positions };
      for (const star of looseArrange(stars, edges)) {
        next[star.id] = { x: star.x, y: star.y };
      }
      write(next);
    },
    [enabled, positions, write],
  );

  const reset = useCallback(() => write({}), [write]);

  const dirty = enabled && Object.keys(positions).length > 0;

  return { apply, moveStar, rearrange, reset, dirty };
}

export type { FieldCamera };
