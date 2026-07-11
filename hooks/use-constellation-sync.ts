"use client";

import type { SkyConfig } from "@/features/constellation/config";
import { useBuilderStore } from "@/features/constellation/store/builder.store";
import {
  type CreationSync,
  type SyncStatus,
  useCreationSync,
} from "@/hooks/use-creation-sync";

export type { SyncStatus };
export type ConstellationSync = CreationSync;

function skyTitle(doc: SkyConfig): string {
  return doc.constellationName.trim() || "Constellation";
}

/** Connects the Constellation builder store to the backend (see `useCreationSync`). */
export function useConstellationSync(): ConstellationSync {
  const doc = useBuilderStore((s) => s.doc);
  const load = useBuilderStore((s) => s.loadDoc);
  return useCreationSync<SkyConfig>({
    type: "constellation",
    doc,
    load,
    makeTitle: skyTitle,
  });
}
