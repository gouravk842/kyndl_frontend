"use client";

import { Eye, X } from "lucide-react";
import { useMemo, useState } from "react";

import { useSpotifyPlaqueSync } from "@/hooks/use-spotify-plaque-sync";

import { useBuilderStore } from "../../store/builder.store";
import { SpotifyPlaqueExperience } from "../spotify-plaque-experience";
import { BuilderPanel } from "./builder-panel";

/**
 * The Spotify Plaque customization panel: an editor rail beside a live plaque
 * that re-renders from the draft as you type. A "Preview" button opens the whole
 * scene full-screen (music included).
 */
export function SpotifyPlaqueBuilder() {
  const sync = useSpotifyPlaqueSync();
  const doc = useBuilderStore((s) => s.doc);
  const assets = useBuilderStore((s) => s.assets);
  const localPreviews = useBuilderStore((s) => s.localPreviews);

  const [previewing, setPreviewing] = useState(false);

  const mediaUrls = useMemo(
    () => ({ ...assets, ...localPreviews }),
    [assets, localPreviews],
  );

  return (
    <div className="flex h-[calc(100dvh-4rem)] w-full flex-col-reverse sm:flex-row">
      <BuilderPanel
        sync={sync}
        className="h-1/2 w-full shrink-0 border-t sm:h-full sm:w-[380px] sm:border-t-0 sm:border-r"
      />

      {/* Live preview — the real experience, fed the draft. */}
      <div className="relative h-1/2 flex-1 overflow-y-auto sm:h-full">
        <SpotifyPlaqueExperience
          config={doc}
          assets={mediaUrls}
          playMusic={false}
          className="min-h-full"
        />

        <button
          type="button"
          onClick={() => setPreviewing(true)}
          className="fixed right-4 bottom-4 z-[60] inline-flex items-center gap-1.5 rounded-full bg-black/55 px-4 py-2 text-sm font-semibold text-white shadow-lg backdrop-blur transition-colors hover:bg-black/70 sm:absolute"
        >
          <Eye className="size-4" /> Full preview
        </button>
      </div>

      {/* Full-screen preview overlay */}
      {previewing && (
        <div className="fixed inset-0 z-[80] overflow-y-auto">
          <button
            type="button"
            aria-label="Close preview"
            onClick={() => setPreviewing(false)}
            className="fixed top-4 right-4 z-[81] grid size-10 place-items-center rounded-full bg-black/55 text-white shadow-lg backdrop-blur transition-colors hover:bg-black/75"
          >
            <X className="size-5" />
          </button>
          <SpotifyPlaqueExperience config={doc} assets={mediaUrls} />
        </div>
      )}
    </div>
  );
}
