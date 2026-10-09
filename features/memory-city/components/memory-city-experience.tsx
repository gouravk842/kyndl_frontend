"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo } from "react";

import { SEED_DOC } from "../data/seed-city";
import { buildCityConfig, type CityDoc } from "../lib/city-from-memories";
import { useMemoryCityStore } from "../store";
import type { CityConfig } from "../types";
import { MemoryCityGallery } from "./ui/memory-city-gallery";

const MemoryCityCanvas = dynamic(
  () => import("./memory-city-canvas").then((m) => m.MemoryCityCanvas),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center bg-[#0b0a1a]">
        <p className="animate-pulse font-display text-2xl text-[#7fd9ff]">
          building the city…
        </p>
      </div>
    ),
  },
);

/**
 * Entry point for Memory City. Pass a meaning-only `doc` (+ optional assets /
 * progress key). Falls back to a 2D gallery when WebGL is forced off.
 */
export function MemoryCityExperience({
  doc = SEED_DOC,
  preview = false,
  assets = {},
  progressKey,
}: {
  doc?: CityDoc;
  preview?: boolean;
  assets?: Record<string, string>;
  progressKey?: string | null;
}) {
  const forceGallery = useMemoryCityStore((s) => s.forceGallery);
  const hydrateProgress = useMemoryCityStore((s) => s.hydrateProgress);
  const setForceGallery = useMemoryCityStore((s) => s.setForceGallery);

  const city: CityConfig = useMemo(() => {
    try {
      return buildCityConfig(doc, {}, assets);
    } catch {
      return buildCityConfig(SEED_DOC, {}, assets);
    }
  }, [doc, assets]);

  useEffect(() => {
    // Always start in 3D; gallery is only for real context-loss.
    setForceGallery(false);
    hydrateProgress(progressKey ?? city.id);
  }, [progressKey, city.id, hydrateProgress, setForceGallery]);

  if (forceGallery) {
    return <MemoryCityGallery city={city} />;
  }

  return (
    <MemoryCityCanvas
      city={city}
      autoStart={preview}
      progressKey={progressKey ?? city.id}
    />
  );
}
