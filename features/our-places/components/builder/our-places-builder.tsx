"use client";

import { Eye } from "lucide-react";
import dynamic from "next/dynamic";
import { useState } from "react";

import { useOurPlacesSync } from "@/hooks/use-our-places-sync";

import { BuilderPanel } from "./builder-panel";

// Leaflet touches `window`, so the editable map is client-only.
const BuilderMap = dynamic(
  () => import("./builder-map").then((m) => m.BuilderMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center bg-[#fdf3ec]">
        <p className="animate-pulse font-display text-lg text-[#c75b39]">
          unfolding the map…
        </p>
      </div>
    ),
  },
);

const BuilderPreview = dynamic(
  () => import("./builder-preview").then((m) => m.BuilderPreview),
  { ssr: false },
);

/**
 * The Our Places customization panel: an editor rail beside a live, editable
 * map. Both halves drive the same builder store; the sync hook persists the
 * document to the backend.
 */
export function OurPlacesBuilder() {
  const sync = useOurPlacesSync();
  const [previewOpen, setPreviewOpen] = useState(false);
  return (
    <div className="flex h-[calc(100dvh-4rem)] w-full flex-row">
      <BuilderPanel
        sync={sync}
        className="h-full w-[280px] shrink-0 border-r sm:w-[380px]"
      />
      <div className="relative h-full flex-1">
        <BuilderMap />
        <button
          type="button"
          onClick={() => setPreviewOpen(true)}
          className="absolute top-4 right-4 z-[600] inline-flex items-center gap-1.5 rounded-full bg-[#3a2a25]/85 px-4 py-2 text-sm font-semibold text-white shadow-lg backdrop-blur transition-colors hover:bg-[#3a2a25]"
        >
          <Eye className="size-4" /> Preview
        </button>
      </div>
      {previewOpen && <BuilderPreview onClose={() => setPreviewOpen(false)} />}
    </div>
  );
}
