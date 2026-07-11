"use client";

import type { WheelConfig } from "@/features/naughty-spins/config";
import { useBuilderStore } from "@/features/naughty-spins/store/builder.store";
import {
  type CreationSync,
  type SyncStatus,
  useCreationSync,
} from "@/hooks/use-creation-sync";

export type { SyncStatus };
export type NaughtySpinsSync = CreationSync;

/** The card title we store for a wheel — falls back so the dashboard card never
 *  reads "Untitled". */
function wheelTitle(doc: WheelConfig): string {
  const name = doc.recipientName.trim();
  return name ? `Naughty Spins for ${name}` : "Naughty Spins";
}

/** Connects the Naughty Spins builder store to the backend (see `useCreationSync`). */
export function useNaughtySpinsSync(): NaughtySpinsSync {
  const doc = useBuilderStore((s) => s.doc);
  const load = useBuilderStore((s) => s.loadDoc);
  return useCreationSync<WheelConfig>({
    type: "naughty-spins",
    doc,
    load,
    makeTitle: wheelTitle,
  });
}
