"use client";

import type { LudoConfig } from "@/features/ludo/config";
import { useBuilderStore } from "@/features/ludo/store/builder.store";
import {
  type CreationSync,
  type SyncStatus,
  useCreationSync,
} from "@/hooks/use-creation-sync";

export type { SyncStatus };
export type LudoSync = CreationSync;

/** Card title for a Ludo board — falls back so the dashboard never reads
 *  "Untitled". */
function ludoTitle(doc: LudoConfig): string {
  const title = doc.title.trim();
  if (title) return title;
  const names = doc.players
    .map((p) => p.name.trim())
    .filter(Boolean)
    .slice(0, 2);
  return names.length === 2 ? `Ludo — ${names.join(" & ")}` : "Ludo for Two";
}

/** Connects the Ludo builder store to the backend (see `useCreationSync`). */
export function useLudoSync(): LudoSync {
  const doc = useBuilderStore((s) => s.doc);
  const load = useBuilderStore((s) => s.loadDoc);
  return useCreationSync<LudoConfig>({
    type: "ludo",
    doc,
    load,
    makeTitle: ludoTitle,
  });
}
