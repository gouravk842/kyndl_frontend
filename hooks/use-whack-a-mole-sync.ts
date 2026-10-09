"use client";

import type { WhackAMoleConfig } from "@/features/whack-a-mole/config";
import { useBuilderStore } from "@/features/whack-a-mole/store/builder.store";
import {
  type CreationSync,
  type SyncStatus,
  useCreationSync,
} from "@/hooks/use-creation-sync";

export type { SyncStatus };
export type WhackAMoleSync = CreationSync;

function moleTitle(doc: WhackAMoleConfig): string {
  const title = doc.title.trim();
  if (title) return title;
  return "Whack My Face";
}

/** Connects the Whack My Face builder store to the backend. */
export function useWhackAMoleSync(): WhackAMoleSync {
  const doc = useBuilderStore((s) => s.doc);
  const load = useBuilderStore((s) => s.loadDoc);
  return useCreationSync<WhackAMoleConfig>({
    type: "whack-a-mole",
    doc,
    load,
    makeTitle: moleTitle,
  });
}
