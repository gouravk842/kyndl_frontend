"use client";

import { Loader2 } from "lucide-react";
import { type ReactNode, useState } from "react";

import { SignInLink } from "@/components/auth/sign-in-link";
import { CollaboratorsPanel } from "@/features/collaboration/components/collaborators-panel";
import { cn } from "@/lib/utils";

import { InteractionSettings } from "./interaction-settings";

/**
 * The minimal, feature-agnostic view of a builder's persistence hook that the
 * shell needs to render the header. Every experience's `use…Sync` hook exposes
 * this shape (plus its own extras), so any of them satisfies it structurally.
 */
export interface BuilderSync {
  /** Whether saving to the cloud is possible (i.e. the user is signed in). */
  enabled: boolean;
  /** Coarse persistence state driving the save button + note copy. */
  status: "idle" | "saving" | "saved" | "error" | (string & {});
  /** Unsaved local edits pending a save. */
  dirty: boolean;
  /** Persist the current document. */
  save: () => void;
  /** The saved creation's id, or null before the first save. */
  creationId: string | null;
}

export interface BuilderTab {
  key: string;
  label: string;
  /** Optional count pill (e.g. number of items in a list tab). */
  badge?: number;
  content: ReactNode;
}

/**
 * The shared chrome for every experience builder: a sticky header carrying the
 * title, save state and a horizontal tab bar, over a scrolling body that swaps
 * per tab. Feature-specific tabs are passed in; the two cross-cutting tabs —
 * **People** (collaborators) and **Interaction** (comments / reviews / chat) —
 * are appended automatically so they appear identically in every builder.
 *
 * Modelled on the original memory-pages sidebar so the look is unchanged; the
 * feature just provides its own `title` and content tabs.
 */
export function BuilderShell({
  title,
  sync,
  tabs,
  className,
  defaultTab,
}: {
  title: string;
  sync: BuilderSync;
  tabs: BuilderTab[];
  className?: string;
  /** Tab key to open first; defaults to the first feature tab. */
  defaultTab?: string;
}) {
  const allTabs: BuilderTab[] = [
    ...tabs,
    {
      key: "people",
      label: "People",
      content: (
        <CollaboratorsPanel targetType="creation" refId={sync.creationId} />
      ),
    },
    {
      key: "interaction",
      label: "Interaction",
      content: <InteractionSettings creationId={sync.creationId} />,
    },
  ];

  const [tab, setTab] = useState<string>(defaultTab ?? allTabs[0]?.key ?? "");
  const active = allTabs.find((t) => t.key === tab) ?? allTabs[0];

  return (
    <aside
      className={cn(
        "flex h-full w-full flex-col overflow-hidden border-[#f2dace] bg-[#fffaf4]",
        className,
      )}
    >
      <div className="sticky top-0 z-10 border-b border-[#f2dace] bg-[#fffaf4]/95 px-5 pt-4 backdrop-blur">
        <div className="flex items-center justify-between gap-3">
          <h1 className="font-display text-lg text-[#3a2a25]">{title}</h1>
          <SaveButton sync={sync} />
        </div>
        <SyncNote sync={sync} />

        <div
          role="tablist"
          aria-label="Builder sections"
          className="mt-3 flex items-center gap-1 overflow-x-auto scrollbar-hide"
        >
          {allTabs.map((t) => {
            const isActive = t.key === active?.key;
            return (
              <button
                key={t.key}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setTab(t.key)}
                className={cn(
                  "-mb-px flex items-center gap-1.5 border-b-2 px-2.5 py-2 text-sm font-medium whitespace-nowrap transition-colors",
                  isActive
                    ? "border-[#ff7a59] text-[#c75b39]"
                    : "border-transparent text-[#92786c] hover:text-[#3a2a25]",
                )}
              >
                {t.label}
                {t.badge != null && (
                  <span
                    className={cn(
                      "grid size-4.5 place-items-center rounded-full text-[11px] font-semibold",
                      isActive
                        ? "bg-[#ff7a59] text-white"
                        : "bg-[#f4e3d4] text-[#92786c]",
                    )}
                  >
                    {t.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4">{active?.content}</div>
    </aside>
  );
}

// ── Header controls (shared save state UI) ──────────────────────────
function SaveButton({ sync }: { sync: BuilderSync }) {
  if (!sync.enabled) {
    return (
      <SignInLink className="rounded-full bg-[#ff7a59] px-4 py-1.5 text-sm font-semibold text-white hover:bg-[#f2596f]">
        Sign in to save
      </SignInLink>
    );
  }
  const saving = sync.status === "saving";
  return (
    <button
      type="button"
      onClick={sync.save}
      disabled={saving || !sync.dirty}
      className="inline-flex items-center gap-1.5 rounded-full bg-[#ff7a59] px-4 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-[#f2596f] disabled:cursor-not-allowed disabled:opacity-50"
    >
      {saving && <Loader2 className="size-3.5 animate-spin" />}
      {saving ? "Saving…" : sync.dirty ? "Save" : "Saved"}
    </button>
  );
}

function SyncNote({ sync }: { sync: BuilderSync }) {
  let text = "";
  if (!sync.enabled)
    text = "Editing a local draft — sign in to save to the cloud.";
  else if (sync.status === "error") text = "Couldn't save — try again.";
  else if (sync.status === "saved") text = "All changes saved.";
  else if (sync.dirty) text = "Unsaved changes.";
  if (!text) return null;
  return (
    <p
      className={cn(
        "mt-1.5 text-xs",
        sync.status === "error" ? "text-[#c0392b]" : "text-[#92786c]",
      )}
    >
      {text}
    </p>
  );
}
