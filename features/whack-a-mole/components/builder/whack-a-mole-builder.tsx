"use client";

import { Hammer, X } from "lucide-react";
import { useMemo, useState } from "react";

import { useWhackAMoleSync } from "@/hooks/use-whack-a-mole-sync";

import { useBuilderStore } from "../../store/builder.store";
import { WhackAMoleExperience } from "../whack-a-mole-experience";
import { BuilderPanel } from "./builder-panel";

/**
 * Customization rail + on-demand preview. The arcade is heavy enough that we
 * don't remount it on every keystroke (same pattern as Ludo).
 */
export function WhackAMoleBuilder() {
  const sync = useWhackAMoleSync();
  const doc = useBuilderStore((s) => s.doc);
  const urlFor = useBuilderStore((s) => s.urlFor);
  const [previewing, setPreviewing] = useState(false);

  const previewAssets = useMemo(() => {
    if (!doc.face) return {};
    const url = urlFor(doc.face);
    return url ? { [doc.face.fileId]: url } : {};
  }, [doc.face, urlFor]);

  return (
    <div className="flex h-[calc(100dvh-4rem)] w-full flex-col-reverse sm:flex-row">
      <BuilderPanel
        sync={sync}
        onPreview={() => setPreviewing(true)}
        className="h-1/2 w-full shrink-0 border-t sm:h-full sm:w-[380px] sm:border-t-0 sm:border-r"
      />

      <div className="relative flex h-1/2 flex-1 items-center justify-center overflow-hidden bg-[#fdf3ec] p-6 sm:h-full">
        <div className="max-w-sm text-center">
          <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-white shadow-sm">
            <Hammer className="size-8 text-[#c75b39]" />
          </div>
          <h2 className="mt-4 font-display text-2xl text-[#3a2a25]">
            {doc.title.trim() || "Whack My Face"}
          </h2>
          <p className="mt-1 text-sm text-[#7a6258]">
            {doc.face ? "Face ready · " : "Add your face · "}
            {doc.difficulty}
          </p>
          <button
            type="button"
            onClick={() => setPreviewing(true)}
            className="mt-5 inline-flex h-11 items-center gap-2 rounded-full bg-gradient-to-r from-[#ff7a59] to-[#f2596f] px-6 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5"
          >
            <Hammer className="size-4" /> Play a preview
          </button>
        </div>
      </div>

      {previewing && (
        <div className="fixed inset-0 z-[80] bg-[#fdf3ec]">
          <button
            type="button"
            aria-label="Close preview"
            onClick={() => setPreviewing(false)}
            className="fixed top-4 right-4 z-[81] grid size-10 place-items-center rounded-full bg-black/55 text-white shadow-lg backdrop-blur transition-colors hover:bg-black/75"
          >
            <X className="size-5" />
          </button>
          <WhackAMoleExperience
            config={doc}
            assets={previewAssets}
            className="h-dvh min-h-dvh"
          />
        </div>
      )}
    </div>
  );
}
