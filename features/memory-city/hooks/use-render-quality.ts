"use client";

import { useEffect } from "react";

import {
  detectInitialQuality,
  detectReducedMotion,
  detectRoamAllowed,
} from "../lib/detect-quality";
import { useMemoryCityStore } from "../store";

/** Seed quality / motion / roam flags once on the client. */
export function useRenderQualityBootstrap() {
  const setQuality = useMemoryCityStore((s) => s.setQuality);
  const setReducedMotion = useMemoryCityStore((s) => s.setReducedMotion);
  const setRoamAllowed = useMemoryCityStore((s) => s.setRoamAllowed);

  useEffect(() => {
    setQuality(detectInitialQuality());
    setReducedMotion(detectReducedMotion());
    setRoamAllowed(detectRoamAllowed());
  }, [setQuality, setReducedMotion, setRoamAllowed]);
}
