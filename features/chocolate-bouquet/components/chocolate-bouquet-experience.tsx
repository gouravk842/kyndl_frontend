"use client";

import dynamic from "next/dynamic";

import { BOUQUET_CONFIG, type BouquetConfig } from "../config";

// R3F touches the DOM/WebGL on mount, so the canvas is client-only. `ssr: false`
// must live inside a Client Component (Next 16 rule) — same pattern as Memory City.
const BouquetCanvas = dynamic(
  () => import("./bouquet-canvas").then((m) => m.BouquetCanvas),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center bg-[#1c0b12]">
        <p className="animate-pulse font-serif text-2xl text-[#e6a4a4]">
          gathering the bouquet…
        </p>
      </div>
    ),
  },
);

/**
 * Entry point for the Chocolate Bouquet experience. Reads a {@link BouquetConfig}
 * (defaults to the sample so the marketing page renders with no wiring); the
 * public viewer of a saved creation and the builder's live preview both mount
 * this with a `doc`. `preview` skips the wrapping ceremony so edits show at once.
 */
export function ChocolateBouquetExperience({
  config = BOUQUET_CONFIG,
  preview = false,
}: {
  config?: BouquetConfig;
  preview?: boolean;
}) {
  return <BouquetCanvas config={config} autoStart={preview} />;
}
