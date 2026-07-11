"use client";

import { X } from "lucide-react";
import { useState } from "react";

import type { MomentSync } from "@/hooks/use-proposal-sync";
import { cn } from "@/lib/utils";

import { themeTokens } from "../../lib/themes";
import type { MomentBuilderStore } from "../../store/create-builder-store";
import { AmbientBg } from "../ambient-bg";
import { MomentPlayer } from "../moment-player";
import { MomentBuilderPanel } from "./builder-panel";

/**
 * The Moment customization screen: an editor rail beside a themed teaser of the
 * moment. Because a Moment is an immersive, played-forward experience (not a
 * board you arrange), the preview is a full-screen mount of the real engine fed
 * the live draft — opened from either the rail or the teaser. Both Moment
 * flavours reuse this; only the store, sync, and a little copy differ.
 */
export function MomentBuilder({
  store,
  sync,
  kind,
}: {
  store: MomentBuilderStore;
  sync: MomentSync;
  kind: "proposal" | "date-ask";
}) {
  const doc = store((s) => s.doc);
  const t = themeTokens(doc.theme);
  const [previewing, setPreviewing] = useState(false);
  // Bumped on each open so the engine remounts fresh from the current draft.
  const [previewKey, setPreviewKey] = useState(0);

  function openPreview() {
    setPreviewKey((k) => k + 1);
    setPreviewing(true);
  }

  return (
    <div className="flex h-[calc(100dvh-4rem)] w-full flex-col-reverse sm:flex-row">
      <MomentBuilderPanel
        store={store}
        sync={sync}
        kind={kind}
        onPreview={openPreview}
        className="h-1/2 w-full shrink-0 border-t sm:h-full sm:w-[400px] sm:border-t-0 sm:border-r"
      />

      {/* Themed teaser of the moment. */}
      <div className="relative h-1/2 flex-1 overflow-hidden sm:h-full">
        <AmbientBg theme={doc.theme} />
        <div className="relative z-10 flex h-full flex-col items-center justify-center gap-6 px-8 text-center">
          <p className={cn("text-xs uppercase tracking-[0.3em]", t.muted)}>
            your moment
          </p>
          <h2
            className={cn(
              "max-w-md text-4xl leading-tight sm:text-5xl",
              t.headlineFont,
              t.text,
            )}
          >
            {doc.question.text || "Your question…"}
          </h2>
          <button
            type="button"
            onClick={openPreview}
            className={cn(
              "rounded-full px-7 py-3 text-lg font-semibold shadow-lg",
              t.accentBg,
              t.accentText,
            )}
          >
            Preview the moment
          </button>
        </div>
      </div>

      {/* Full-screen live preview of the real engine, fed the live draft. */}
      {previewing && (
        <div className="fixed inset-0 z-[80] bg-black">
          <MomentPlayer key={previewKey} doc={doc} />
          <button
            type="button"
            onClick={() => setPreviewing(false)}
            aria-label="Close preview"
            className="absolute right-4 top-4 z-[81] inline-flex items-center gap-1.5 rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur transition-colors hover:bg-white/20"
          >
            <X className="size-4" /> Close preview
          </button>
        </div>
      )}
    </div>
  );
}
