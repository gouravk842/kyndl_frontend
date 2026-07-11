"use client";

import type { DiceConfig } from "@/features/dice-of-desire/config";
import { useBuilderStore } from "@/features/dice-of-desire/store/builder.store";
import {
  type CreationSync,
  type SyncStatus,
  useCreationSync,
} from "@/hooks/use-creation-sync";

export type { SyncStatus };
export type DiceOfDesireSync = CreationSync;

/** The card title we store for a game — falls back so the dashboard card never
 *  reads "Untitled". */
function gameTitle(doc: DiceConfig): string {
  const name = doc.recipientName.trim();
  return name ? `Dice of Desire for ${name}` : "Dice of Desire";
}

/** Connects the Dice of Desire builder store to the backend (see `useCreationSync`). */
export function useDiceOfDesireSync(): DiceOfDesireSync {
  const doc = useBuilderStore((s) => s.doc);
  const load = useBuilderStore((s) => s.loadDoc);
  return useCreationSync<DiceConfig>({
    type: "dice-of-desire",
    doc,
    load,
    makeTitle: gameTitle,
  });
}
