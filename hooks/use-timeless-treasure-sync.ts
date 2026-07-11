"use client";

import type { TimelessTreasureConfig } from "@/features/timeless-treasure/config";
import { useBuilderStore } from "@/features/timeless-treasure/store/builder.store";
import {
  type CreationSync,
  type SyncStatus,
  useCreationSync,
} from "@/hooks/use-creation-sync";

export type { SyncStatus };
export type TimelessTreasureSync = CreationSync;

/** The card title we store for a treasure — falls back so the dashboard card
 *  never reads "Untitled". */
function treasureTitle(doc: TimelessTreasureConfig): string {
  const name = doc.recipientName.trim();
  return name ? `${name}'s treasure` : "Timeless Treasure";
}

/** Connects the Timeless Treasure builder store to the backend (see `useCreationSync`). */
export function useTimelessTreasureSync(): TimelessTreasureSync {
  const doc = useBuilderStore((s) => s.doc);
  const load = useBuilderStore((s) => s.loadDoc);
  return useCreationSync<TimelessTreasureConfig>({
    type: "timeless-treasure",
    doc,
    load,
    makeTitle: treasureTitle,
  });
}
