"use client";

import { useTwentyFourReasonsSync } from "@/hooks/use-twenty-four-reasons-sync";

import { BuilderPanel } from "./builder-panel";
import { ReasonsPreview } from "./reasons-preview";

/**
 * 24 Reasons customization: editor rail beside a live sealed-gallery preview
 * with a time scrubber.
 */
export function ReasonsBuilder() {
  const sync = useTwentyFourReasonsSync();

  return (
    <div className="flex h-[calc(100dvh-4rem)] w-full flex-col-reverse sm:flex-row">
      <BuilderPanel
        sync={sync}
        className="h-1/2 w-full shrink-0 border-t border-[#e8d5c4] sm:h-full sm:w-[400px] sm:border-t-0 sm:border-r"
      />
      <div className="relative h-1/2 min-h-0 flex-1 sm:h-full">
        <ReasonsPreview />
      </div>
    </div>
  );
}
