"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";

import { SEED_DOC } from "../data/seed-city";
import { buildCityConfig, type CityDoc } from "../lib/city-from-memories";
import type { CityConfig } from "../types";

// R3F + Rapier touch the DOM/WebGL on mount, so the canvas is client-only.
// `ssr: false` must live inside a Client Component (Next 16 rule) — same pattern
// as the original Memory Lane experience.
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
 * Entry point for the Memory City experience.
 *
 * Reads a **meaning-only** {@link CityDoc} (defaults to the seed) and runs the
 * layout engine to derive the renderable {@link CityConfig} — the single bridge
 * from stored meaning to a placed world. The marketing page, the public viewer
 * of a saved creation, and the builder's live preview all mount this: pass a
 * `doc`, get a city. `preview` skips the enter ceremony so the builder sees edits
 * immediately. A malformed doc falls back to the seed rather than crashing.
 */
export function MemoryCityExperience({
  doc = SEED_DOC,
  preview = false,
}: {
  doc?: CityDoc;
  preview?: boolean;
}) {
  const city: CityConfig = useMemo(() => {
    try {
      return buildCityConfig(doc);
    } catch {
      return buildCityConfig(SEED_DOC);
    }
  }, [doc]);

  return <MemoryCityCanvas city={city} autoStart={preview} />;
}
