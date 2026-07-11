"use client";

import { X } from "lucide-react";
import { useMemo, useState } from "react";

import { useMemoryJarSync } from "@/hooks/use-memory-jar-sync";

import { useBuilderStore } from "../../store/builder.store";
import { MemoryJarExperience } from "../memory-jar-experience";
import { BuilderPanel } from "./builder-panel";

const WARM_SURFACE =
  "linear-gradient(160deg, #fdf3e7 0%, #f5e0c3 60%, #ead5b0 100%)";

/**
 * The Memory Jar customization panel: an editor rail beside a live jar that
 * re-renders from the draft as you type. Both halves read the same builder
 * store; the sync hook persists the document to the backend. A "Preview" button
 * opens the jar full-screen for an undistracted look before saving.
 */
export function MemoryJarBuilder() {
  const sync = useMemoryJarSync();
  const doc = useBuilderStore((s) => s.doc);
  const assets = useBuilderStore((s) => s.assets);
  const localPreviews = useBuilderStore((s) => s.localPreviews);

  const [previewing, setPreviewing] = useState(false);

  // Local object URLs win over loaded presigned URLs, so just-uploaded media
  // shows immediately in the preview.
  const mediaUrls = useMemo(
    () => ({ ...assets, ...localPreviews }),
    [assets, localPreviews],
  );

  return (
    <div className="flex h-[calc(100dvh-4rem)] w-full flex-col-reverse sm:flex-row">
      <BuilderPanel
        sync={sync}
        onPreview={() => setPreviewing(true)}
        className="h-1/2 w-full shrink-0 border-t sm:h-full sm:w-[380px] sm:border-t-0 sm:border-r"
      />

      {/* Live preview — the real experience, fed the draft. */}
      <div className="relative flex h-1/2 flex-1 items-center justify-center overflow-y-auto sm:h-full">
        {/* warm surface — matches the live /memory-jar page */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{ background: WARM_SURFACE }}
        />
        <div className="relative w-full max-w-3xl px-4 py-8 sm:px-6">
          {/* key remounts the jar when the note count changes, so the scatter
              re-lays-out cleanly and the "opened" state resets for a fresh
              preview as notes are added or removed. */}
          <MemoryJarExperience
            key={doc.notes.length}
            config={doc}
            assets={mediaUrls}
            playMusic={!previewing}
          />
        </div>
      </div>

      {/* Full-screen preview overlay */}
      {previewing && (
        <div className="fixed inset-0 z-[80] overflow-y-auto">
          <div
            aria-hidden
            className="pointer-events-none fixed inset-0"
            style={{ background: WARM_SURFACE }}
          />
          <button
            type="button"
            aria-label="Close preview"
            onClick={() => setPreviewing(false)}
            className="fixed right-4 top-4 z-[81] grid size-10 place-items-center rounded-full bg-[#3a2a25]/80 text-[#fdf3e7] shadow-lg backdrop-blur transition-colors hover:bg-[#3a2a25]"
          >
            <X className="size-5" />
          </button>
          <div className="relative mx-auto flex min-h-full w-full max-w-5xl items-center justify-center px-4 py-12 sm:px-6">
            <MemoryJarExperience config={doc} assets={mediaUrls} />
          </div>
        </div>
      )}
    </div>
  );
}
