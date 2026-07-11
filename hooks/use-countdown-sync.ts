"use client";

import type { CountdownConfig } from "@/features/countdown/config";
import { useBuilderStore } from "@/features/countdown/store/builder.store";
import {
  type CreationSync,
  type SyncStatus,
  useCreationSync,
} from "@/hooks/use-creation-sync";

export type { SyncStatus };
export type CountdownSync = CreationSync;

/** The card title we store for a countdown — falls back so the dashboard card
 *  never reads "Untitled". */
function countdownTitle(doc: CountdownConfig): string {
  const title = doc.title.trim();
  if (title) return title;
  const name = doc.recipientName.trim();
  return name ? `Countdown for ${name}` : "Countdown";
}

/** Connects the Countdown builder store to the backend (see `useCreationSync`). */
export function useCountdownSync(): CountdownSync {
  const doc = useBuilderStore((s) => s.doc);
  const load = useBuilderStore((s) => s.loadDoc);
  return useCreationSync<CountdownConfig>({
    type: "countdown",
    doc,
    load,
    makeTitle: countdownTitle,
  });
}
