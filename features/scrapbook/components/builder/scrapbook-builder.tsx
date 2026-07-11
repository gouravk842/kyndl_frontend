"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { ROUTES } from "@/constants/routes";
import {
  type ScrapbookSync,
  useScrapbookSync,
} from "@/hooks/use-scrapbook-sync";
import { cn } from "@/lib/utils";

import { useBuilderStore } from "../../store/builder.store";
import { getTemplate } from "../../templates";
import { BookViewer } from "../viewer/book-viewer";
import { BuilderCanvas } from "./builder-canvas";
import { BuilderInspector } from "./builder-inspector";
import { BuilderPagesRail } from "./builder-pages-rail";
import { StartScreen } from "./start-screen";

function syncLabel(sync: ScrapbookSync): string {
  switch (sync.status) {
    case "disabled":
      return "saved on this device · sign in to sync";
    case "loading":
      return "opening your scrapbook…";
    case "saving":
      return "saving…";
    case "saved":
      return "all changes saved";
    case "error":
      return "couldn’t save — try again";
    default:
      return sync.dirty ? "unsaved changes" : "saved on this device";
  }
}

export function ScrapbookBuilder() {
  const story = useBuilderStore((s) => s.story);
  const chosen = useBuilderStore((s) => s.chosen);
  const backToChooser = useBuilderStore((s) => s.backToChooser);
  const unlockLayout = useBuilderStore((s) => s.unlockLayout);
  const loadTemplate = useBuilderStore((s) => s.loadTemplate);
  const [mode, setMode] = useState<"edit" | "preview">("edit");

  const router = useRouter();
  const params = useSearchParams();
  const templateParam = params.get("template");

  // Connects the local builder to the backend: loads an existing scrapbook and
  // autosaves edits when the user is signed in (a no-op otherwise).
  const sync = useScrapbookSync();

  const locked = !!story.locked;
  const template = story.templateId ? getTemplate(story.templateId) : undefined;

  // Deep link (`?template=`) from the marketing gallery — load it once, even for
  // a returning user, then strip the param so a refresh won't re-clobber edits.
  useEffect(() => {
    if (!templateParam || story.templateId === templateParam) return;
    loadTemplate(templateParam);
    const sp = new URLSearchParams(Array.from(params.entries()));
    sp.delete("template");
    router.replace(
      `${ROUTES.scrapbookBuild}${sp.toString() ? `?${sp.toString()}` : ""}`,
      { scroll: false },
    );
  }, [templateParam, story.templateId, loadTemplate, params, router]);

  // Start screen — unless the user has already picked a starting point, is
  // opening a saved scrapbook (`?id=`), or is following a template deep link.
  if (!chosen && !sync.creationId && !templateParam) {
    return <StartScreen />;
  }

  if (mode === "preview") {
    return (
      <div className="flex flex-col items-center">
        <div className="mb-4 flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMode("edit")}
            className="inline-flex h-10 items-center rounded-full border border-[#F2DACE] bg-white/70 px-5 text-sm text-[#3A2A25] transition-colors hover:border-[#FF7A59]/50 hover:bg-white"
          >
            ← Back to editing
          </button>
          <span className="font-hand text-lg text-[#C75B39]">Live preview</span>
        </div>
        {/* key forces a clean remount of the flip engine with the latest draft */}
        <BookViewer key={JSON.stringify(story).length} story={story} />
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100svh-7rem)] min-h-[540px] flex-col overflow-hidden rounded-2xl border border-[#F2DACE] bg-[#FFFBF6]">
      {/* toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#F2DACE] bg-white/70 px-4 py-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-display text-lg text-[#3A2A25]">
              {template ? template.name : "Scrapbook builder"}
            </h2>
            {locked && (
              <span className="rounded-full bg-[#FFE3D6] px-2 py-0.5 text-[10px] font-semibold tracking-wide text-[#C75B39] uppercase">
                Template
              </span>
            )}
          </div>
          <p className="text-xs text-[#92786C]">
            {story.pages.length} page{story.pages.length === 1 ? "" : "s"} ·{" "}
            <span
              className={cn(
                sync.status === "saving" && "text-[#C75B39]",
                sync.status === "error" && "text-red-500",
                sync.dirty && sync.status !== "saving" && "text-[#C75B39]",
              )}
            >
              {syncLabel(sync)}
            </span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          {locked && (
            <ToolbarButton
              onClick={() => {
                if (
                  window.confirm(
                    "Customise the layout? You'll be able to move, add and remove everything — this can't be switched back to the guided template.",
                  )
                )
                  unlockLayout();
              }}
            >
              Customise layout
            </ToolbarButton>
          )}
          <ToolbarButton
            onClick={() => {
              if (
                window.confirm(
                  "Start over? Your current draft stays saved on this device.",
                )
              )
                backToChooser();
            }}
          >
            Start over
          </ToolbarButton>
          <ToolbarButton onClick={() => setMode("preview")}>
            Preview book →
          </ToolbarButton>
          {sync.enabled && (
            <ToolbarButton
              primary
              disabled={
                sync.status === "saving" ||
                sync.status === "loading" ||
                !sync.dirty
              }
              onClick={sync.save}
            >
              {sync.status === "saving" ? "Saving…" : "Save"}
            </ToolbarButton>
          )}
        </div>
      </div>

      {/* workspace */}
      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <aside className="shrink-0 border-b border-[#F2DACE] lg:w-56 lg:border-r lg:border-b-0">
          <BuilderPagesRail />
        </aside>

        <main className="min-h-[320px] min-w-0 flex-1 overflow-hidden bg-[#f3e9dd]">
          <BuilderCanvas />
        </main>

        <aside className="shrink-0 border-t border-[#F2DACE] lg:w-80 lg:border-t-0 lg:border-l">
          <BuilderInspector />
        </aside>
      </div>
    </div>
  );
}

function ToolbarButton({
  children,
  onClick,
  primary,
  disabled,
}: {
  children: React.ReactNode;
  onClick: () => void;
  primary?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex h-10 items-center rounded-full px-4 text-sm transition-all",
        "disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0",
        primary
          ? "bg-gradient-to-r from-[#FF7A59] to-[#F2596F] font-medium text-white kyndl-glow-warm hover:-translate-y-0.5"
          : "border border-[#F2DACE] bg-white/70 text-[#3A2A25] hover:border-[#FF7A59]/50 hover:bg-white",
      )}
    >
      {children}
    </button>
  );
}
