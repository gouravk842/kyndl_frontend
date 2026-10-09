"use client";

import { Eye, X } from "lucide-react";
import { useMemo, useState } from "react";

import { useTimelessTreasureSync } from "@/hooks/use-timeless-treasure-sync";

import { useBuilderStore } from "../../store/builder.store";
import { TimelessTreasureExperience } from "../timeless-treasure-experience";
import { BuilderPanel } from "./builder-panel";

/**
 * The Timeless Treasure customization panel: an editor rail beside a live scene
 * that re-renders from the draft as you type. The preview opens the album up
 * front (`startOpen`) so every edit — note, photos, dedication — is visible
 * without having to re-open. A "Full preview" button plays the whole thing
 * full-screen, from the closed album, music included.
 */
export function TimelessTreasureBuilder() {
  const sync = useTimelessTreasureSync();
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

      {/* Live preview — the real experience, fed the draft, opened up front. */}
      <div className="relative h-1/2 flex-1 overflow-y-auto sm:h-full">
        <TimelessTreasureExperience
          config={doc}
          assets={mediaUrls}
          playMusic={false}
          startOpen
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

      {/* Full-screen preview overlay — from the closed box. */}
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
          <TimelessTreasureExperience config={doc} assets={mediaUrls} />
        </div>
      )}
    </div>
  );
}
