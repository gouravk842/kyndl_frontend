"use client";

import { Eye, X } from "lucide-react";
import { useMemo, useState } from "react";

import { useMemoryLanternSync } from "@/hooks/use-memory-lantern-sync";

import { useBuilderStore } from "../../store/builder.store";
import { MemoryLanternExperience } from "../memory-lantern-experience";
import { BuilderPanel } from "./builder-panel";

/**
 * The Memory Lantern customization panel: an editor rail beside a live lantern
 * that re-renders from the draft as you upload facets and type. A "Full preview"
 * button opens the whole scene full-screen.
 */
export function MemoryLanternBuilder() {
  const sync = useMemoryLanternSync();
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
      <div className="relative h-1/2 flex-1 sm:h-full">
        <MemoryLanternExperience config={doc} assets={mediaUrls} />

        <button
          type="button"
          onClick={() => setPreviewing(true)}
          className="absolute right-4 bottom-4 z-[60] inline-flex items-center gap-1.5 rounded-full bg-black/55 px-4 py-2 text-sm font-semibold text-white shadow-lg backdrop-blur transition-colors hover:bg-black/70"
        >
          <Eye className="size-4" />
          Full preview
        </button>
      </div>

      {previewing && (
        <div className="fixed inset-0 z-[100] bg-[#0a0710]">
          <MemoryLanternExperience config={doc} assets={mediaUrls} />
          <button
            type="button"
            onClick={() => setPreviewing(false)}
            aria-label="Close preview"
            className="absolute top-4 right-4 z-[110] grid size-10 place-items-center rounded-full bg-black/55 text-white shadow-lg backdrop-blur transition-colors hover:bg-black/70"
          >
            <X className="size-5" />
          </button>
        </div>
      )}
    </div>
  );
}
