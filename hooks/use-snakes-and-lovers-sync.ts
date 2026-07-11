"use client";

import type { SnakesConfig } from "@/features/snakes-and-lovers/config";
import { useBuilderStore } from "@/features/snakes-and-lovers/store/builder.store";
import {
  type CreationSync,
  type SyncStatus,
  useCreationSync,
} from "@/hooks/use-creation-sync";

export type { SyncStatus };
export type SnakesAndLoversSync = CreationSync;

/** The card title we store for a game — falls back so the dashboard card never
 *  reads "Untitled". */
function gameTitle(doc: SnakesConfig): string {
  const name = doc.recipientName.trim();
  return name ? `Snakes & Lovers for ${name}` : "Snakes & Lovers";
}

/** Connects the Snakes & Lovers builder store to the backend (see `useCreationSync`). */
export function useSnakesAndLoversSync(): SnakesAndLoversSync {
  const doc = useBuilderStore((s) => s.doc);
  const load = useBuilderStore((s) => s.loadDoc);
  return useCreationSync<SnakesConfig>({
    type: "snakes-and-lovers",
    doc,
    load,
    makeTitle: gameTitle,
  });
}
