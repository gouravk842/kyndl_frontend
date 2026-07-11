"use client";

import { X } from "lucide-react";
import { useState } from "react";

import { useDesireMatcherSync } from "@/hooks/use-desire-matcher-sync";

import { useBuilderStore } from "../../store/builder.store";
import { MatcherExperience } from "../matcher-experience";
import { BuilderPanel } from "./builder-panel";

const RED_SURFACE =
  "radial-gradient(ellipse 70% 60% at 50% 25%, #2a0a18 0%, #1a0710 55%, #0d040a 100%)";

/**
 * The Desire Matcher customization panel: an editor rail beside a live preview
 * of the partner experience, fed the draft. The preview skips the 18+ gate (the
 * builder is already behind sign-in) and remounts when the item count changes so
 * the run resets cleanly as items are added or removed.
 */
export function MatcherBuilder() {
  const sync = useDesireMatcherSync();
  const doc = useBuilderStore((s) => s.doc);
  const [previewing, setPreviewing] = useState(false);

  return (
    <div className="flex h-[calc(100dvh-4rem)] w-full flex-col-reverse sm:flex-row">
      <BuilderPanel
        sync={sync}
        onPreview={() => setPreviewing(true)}
        className="h-1/2 w-full shrink-0 border-t sm:h-full sm:w-[400px] sm:border-t-0 sm:border-r"
      />

      <div className="relative flex h-1/2 flex-1 items-center justify-center overflow-y-auto sm:h-full">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{ background: RED_SURFACE }}
        />
        <div className="relative flex w-full max-w-xl justify-center px-4 py-8 sm:px-6">
          <MatcherExperience key={doc.items.length} content={doc} skipGate />
        </div>
      </div>

      {previewing && (
        <div className="fixed inset-0 z-[80] overflow-y-auto">
          <div
            aria-hidden
            className="pointer-events-none fixed inset-0"
            style={{ background: RED_SURFACE }}
          />
          <button
            type="button"
            aria-label="Close preview"
            onClick={() => setPreviewing(false)}
            className="fixed right-4 top-4 z-[81] grid size-10 place-items-center rounded-full bg-white/10 text-white shadow-lg backdrop-blur transition-colors hover:bg-white/20"
          >
            <X className="size-5" />
          </button>
          <div className="relative mx-auto flex min-h-full w-full max-w-2xl items-center justify-center px-4 py-12 sm:px-6">
            <MatcherExperience content={doc} skipGate />
          </div>
        </div>
      )}
    </div>
  );
}
