"use client";

import { Lock, Sparkles, X } from "lucide-react";
import { useMemo, useState } from "react";

import { useTimeCapsuleSync } from "@/hooks/use-time-capsule-sync";

import { useBuilderStore } from "../../store/builder.store";
import { TimeCapsuleExperience } from "../time-capsule-experience";
import { BuilderPanel } from "./builder-panel";

/**
 * The Time Capsule customization panel: an editor rail beside a live capsule
 * that re-renders from the draft. A "peek" toggle opens the capsule so you can
 * see the letter that lands on the unlock date; a "Preview" button opens the
 * whole thing full-screen.
 */
export function TimeCapsuleBuilder() {
  const sync = useTimeCapsuleSync();
  const doc = useBuilderStore((s) => s.doc);
  const assets = useBuilderStore((s) => s.assets);
  const localPreviews = useBuilderStore((s) => s.localPreviews);

  const [previewing, setPreviewing] = useState(false);
  const [peek, setPeek] = useState(false);

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
      <div className="relative h-1/2 flex-1 overflow-y-auto sm:h-full">
        <TimeCapsuleExperience
          config={doc}
          assets={mediaUrls}
          forceOpen={peek}
          playMusic={false}
          className="min-h-full"
        />

        {/* Peek toggle: sealed ⇄ opened */}
        <button
          type="button"
          onClick={() => setPeek((p) => !p)}
          className="fixed right-4 bottom-4 z-[60] inline-flex items-center gap-1.5 rounded-full bg-black/55 px-4 py-2 text-sm font-semibold text-white shadow-lg backdrop-blur transition-colors hover:bg-black/70 sm:absolute"
        >
          {peek ? (
            <>
              <Lock className="size-4" /> Seal it back up
            </>
          ) : (
            <>
              <Sparkles className="size-4" /> Peek at the letter
            </>
          )}
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
          <TimeCapsuleExperience
            config={doc}
            assets={mediaUrls}
            forceOpen={peek}
          />
        </div>
      )}
    </div>
  );
}
