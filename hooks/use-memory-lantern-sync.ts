"use client";

import type { LanternConfig } from "@/features/memory-lantern/config";
import { useBuilderStore } from "@/features/memory-lantern/store/builder.store";
import {
  type CreationSync,
  type SyncStatus,
  useCreationSync,
} from "@/hooks/use-creation-sync";

export type { SyncStatus };
export type MemoryLanternSync = CreationSync;

/** The card title we store for a lantern — falls back so the dashboard card
 *  never reads "Untitled". */
function lanternTitle(doc: LanternConfig): string {
  const title = doc.title.trim();
  return title || "Memory Lantern";
}

/** Connects the Memory Lantern builder store to the backend (see `useCreationSync`). */
export function useMemoryLanternSync(): MemoryLanternSync {
  const doc = useBuilderStore((s) => s.doc);
  const load = useBuilderStore((s) => s.loadDoc);
  return useCreationSync<LanternConfig>({
    type: "memory-lantern",
    doc,
    load,
    makeTitle: lanternTitle,
  });
}
