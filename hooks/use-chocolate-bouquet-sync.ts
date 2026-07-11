"use client";

import type { BouquetConfig } from "@/features/chocolate-bouquet/config";
import { useBuilderStore } from "@/features/chocolate-bouquet/store/builder.store";
import {
  type CreationSync,
  type SyncStatus,
  useCreationSync,
} from "@/hooks/use-creation-sync";

export type { SyncStatus };
export type ChocolateBouquetSync = CreationSync;

function bouquetTitle(doc: BouquetConfig): string {
  return doc.bouquetName.trim() || "Chocolate Bouquet";
}

/** Connects the Chocolate Bouquet builder store to the backend (see `useCreationSync`). */
export function useChocolateBouquetSync(): ChocolateBouquetSync {
  const doc = useBuilderStore((s) => s.doc);
  const load = useBuilderStore((s) => s.loadDoc);
  return useCreationSync<BouquetConfig>({
    type: "chocolate-bouquet",
    doc,
    load,
    makeTitle: bouquetTitle,
  });
}
