"use client";

import type { DeckConfig } from "@/features/desire-deck/config";
import { useBuilderStore } from "@/features/desire-deck/store/builder.store";
import {
  type CreationSync,
  type SyncStatus,
  useCreationSync,
} from "@/hooks/use-creation-sync";

export type { SyncStatus };
export type DesireDeckSync = CreationSync;

/** The card title we store for a deck — falls back so the dashboard card never
 *  reads "Untitled". */
function deckTitle(doc: DeckConfig): string {
  const name = doc.recipientName.trim();
  return name ? `Desire Deck for ${name}` : "Desire Deck";
}

/** Connects the Desire Deck builder store to the backend (see `useCreationSync`). */
export function useDesireDeckSync(): DesireDeckSync {
  const doc = useBuilderStore((s) => s.doc);
  const load = useBuilderStore((s) => s.loadDoc);
  return useCreationSync<DeckConfig>({
    type: "desire-deck",
    doc,
    load,
    makeTitle: deckTitle,
  });
}
