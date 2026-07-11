"use client";

import { X } from "lucide-react";
import { useState } from "react";

import { useDesireDeckSync } from "@/hooks/use-desire-deck-sync";

import { useBuilderStore } from "../../store/builder.store";
import { DesireDeckExperience } from "../desire-deck-experience";
import { BuilderPanel } from "./builder-panel";

const RED_SURFACE =
  "radial-gradient(ellipse 70% 60% at 50% 25%, #2a0a18 0%, #1a0710 55%, #0d040a 100%)";

/**
 * The Desire Deck customization panel: an editor rail beside a live deck that
 * re-renders from the draft. The preview skips the 18+ gate (the builder is
 * already behind sign-in) and remounts when the card count changes so the deck
 * resets cleanly as cards are added or removed.
 */
export function DesireDeckBuilder() {
  const sync = useDesireDeckSync();
  const doc = useBuilderStore((s) => s.doc);
  const [previewing, setPreviewing] = useState(false);

  return (
    <div className="flex h-[calc(100dvh-4rem)] w-full flex-col-reverse sm:flex-row">
      <BuilderPanel
        sync={sync}
        onPreview={() => setPreviewing(true)}
        className="h-1/2 w-full shrink-0 border-t sm:h-full sm:w-[380px] sm:border-t-0 sm:border-r"
      />

      {/* Live preview — the real experience, fed the draft. */}
      <div className="relative flex h-1/2 flex-1 items-center justify-center overflow-y-auto sm:h-full">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{ background: RED_SURFACE }}
        />
        <div className="relative flex w-full max-w-2xl justify-center px-4 py-8 sm:px-6">
          <DesireDeckExperience key={doc.cards.length} config={doc} skipGate />
        </div>
      </div>

      {/* Full-screen preview overlay */}
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
          <div className="relative mx-auto flex min-h-full w-full max-w-3xl items-center justify-center px-4 py-12 sm:px-6">
            <DesireDeckExperience config={doc} skipGate />
          </div>
        </div>
      )}
    </div>
  );
}
