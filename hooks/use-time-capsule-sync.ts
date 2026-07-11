"use client";

import type { TimeCapsuleConfig } from "@/features/time-capsule/config";
import { useBuilderStore } from "@/features/time-capsule/store/builder.store";
import {
  type CreationSync,
  type SyncStatus,
  useCreationSync,
} from "@/hooks/use-creation-sync";

export type { SyncStatus };
export type TimeCapsuleSync = CreationSync;

/** Card title for a capsule — falls back so the dashboard never reads
 *  "Untitled". */
function capsuleTitle(doc: TimeCapsuleConfig): string {
  const title = doc.title.trim();
  if (title) return title;
  const name = doc.recipientName.trim();
  return name ? `Time Capsule for ${name}` : "Time Capsule";
}

/** Connects the Time Capsule builder store to the backend (see
 *  `useCreationSync`). */
export function useTimeCapsuleSync(): TimeCapsuleSync {
  const doc = useBuilderStore((s) => s.doc);
  const load = useBuilderStore((s) => s.loadDoc);
  return useCreationSync<TimeCapsuleConfig>({
    type: "time-capsule",
    doc,
    load,
    makeTitle: capsuleTitle,
  });
}
