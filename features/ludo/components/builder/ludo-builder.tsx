"use client";

import { Gamepad2, X } from "lucide-react";
import { useState } from "react";

import { useLudoSync } from "@/hooks/use-ludo-sync";

import { useBuilderStore } from "../../store/builder.store";
import { LudoExperience } from "../ludo-experience";
import { BuilderPanel } from "./builder-panel";

/**
 * The Ludo customization panel. Ludo is a full interactive game, so rather than
 * restart the board on every keystroke it uses a full-screen "Play a preview"
 * overlay: opening it seeds a fresh game from the current draft (see
 * `LudoExperience`'s `config` prop). The rail edits players + the couple deck.
 */
export function LudoBuilder() {
  const sync = useLudoSync();
  const doc = useBuilderStore((s) => s.doc);
  const [previewing, setPreviewing] = useState(false);

  return (
    <div className="flex h-[calc(100dvh-4rem)] w-full flex-col-reverse sm:flex-row">
      <BuilderPanel
        sync={sync}
        onPreview={() => setPreviewing(true)}
        className="h-1/2 w-full shrink-0 border-t sm:h-full sm:w-[380px] sm:border-t-0 sm:border-r"
      />

      {/* Resting state: a poster prompting a preview (the game is heavy to keep
          live-mounted, so it opens on demand). */}
      <div className="relative flex h-1/2 flex-1 items-center justify-center overflow-hidden bg-[#fdf3ec] p-6 sm:h-full">
        <div className="max-w-sm text-center">
          <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-white shadow-sm">
            <Gamepad2 className="size-8 text-[#c75b39]" />
          </div>
          <h2 className="mt-4 font-display text-2xl text-[#3a2a25]">
            {doc.title.trim() || "Ludo for Two"}
          </h2>
          <p className="mt-1 text-sm text-[#7a6258]">
            {doc.players.map((p) => p.name.trim() || "Player").join(" · ")}
          </p>
          <button
            type="button"
            onClick={() => setPreviewing(true)}
            className="mt-5 inline-flex h-11 items-center gap-2 rounded-full bg-gradient-to-r from-[#ff7a59] to-[#f2596f] px-6 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5"
          >
            <Gamepad2 className="size-4" /> Play a preview
          </button>
        </div>
      </div>

      {/* Full-screen preview overlay — seeds a fresh game from the draft. */}
      {previewing && (
        <div className="fixed inset-0 z-[80] overflow-y-auto bg-[#fdf3ec]">
          <button
            type="button"
            aria-label="Close preview"
            onClick={() => setPreviewing(false)}
            className="fixed top-4 right-4 z-[81] grid size-10 place-items-center rounded-full bg-black/55 text-white shadow-lg backdrop-blur transition-colors hover:bg-black/75"
          >
            <X className="size-5" />
          </button>
          <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
            <LudoExperience config={doc} />
          </div>
        </div>
      )}
    </div>
  );
}
