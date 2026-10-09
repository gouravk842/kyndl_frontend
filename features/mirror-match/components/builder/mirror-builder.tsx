"use client";

import { X } from "lucide-react";
import { useState } from "react";

import { useMirrorMatchSync } from "@/hooks/use-mirror-match-sync";

import { useBuilderStore } from "../../store/builder.store";
import { MirrorStage } from "../atmosphere";
import { MirrorExperience } from "../mirror-experience";
import { BuilderPanel } from "./builder-panel";

/**
 * Mirror Match customization: editor rail beside a live looking-glass preview.
 */
export function MirrorBuilder() {
  const sync = useMirrorMatchSync();
  const doc = useBuilderStore((s) => s.doc);
  const [previewing, setPreviewing] = useState(false);

  return (
    <div className="flex h-[calc(100dvh-4rem)] w-full flex-col-reverse sm:flex-row">
      <BuilderPanel
        sync={sync}
        onPreview={() => setPreviewing(true)}
        className="h-1/2 w-full shrink-0 border-t sm:h-full sm:w-[400px] sm:border-t-0 sm:border-r"
      />

      <MirrorStage
        occasion={doc.occasion}
        compact
        className="relative flex h-1/2 flex-1 items-center justify-center overflow-y-auto sm:h-full"
      >
        <div className="relative flex w-full max-w-xl justify-center">
          <MirrorExperience key={doc.items.length} content={doc} bare />
        </div>
      </MirrorStage>

      {previewing && (
        <div className="fixed inset-0 z-[80] overflow-y-auto">
          <MirrorStage occasion={doc.occasion} className="min-h-full">
            <div className="relative mx-auto flex min-h-full w-full max-w-2xl items-center justify-center px-4 py-12 sm:px-6">
              <MirrorExperience content={doc} bare />
            </div>
          </MirrorStage>
          <button
            type="button"
            aria-label="Close preview"
            onClick={() => setPreviewing(false)}
            className="fixed right-4 top-4 z-[81] grid size-10 place-items-center rounded-full bg-[#1a1210]/70 text-white shadow-lg backdrop-blur transition-colors hover:bg-[#1a1210]/85"
          >
            <X className="size-5" />
          </button>
        </div>
      )}
    </div>
  );
}
