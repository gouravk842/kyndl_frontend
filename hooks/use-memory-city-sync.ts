"use client";

import type { CityDoc } from "@/features/memory-city/lib/city-from-memories";
import { useBuilderStore } from "@/features/memory-city/store/builder.store";
import {
  type CreationSync,
  type SyncStatus,
  useCreationSync,
} from "@/hooks/use-creation-sync";

export type { SyncStatus };
export type MemoryCitySync = CreationSync;

function cityTitle(doc: CityDoc): string {
  return doc.title.trim() || "Memory City";
}

/** Connects the Memory City builder store to the backend (see `useCreationSync`). */
export function useMemoryCitySync(): MemoryCitySync {
  const doc = useBuilderStore((s) => s.doc);
  const load = useBuilderStore((s) => s.loadDoc);
  return useCreationSync<CityDoc>({
    type: "memory-city",
    doc,
    load,
    makeTitle: cityTitle,
  });
}
