"use client";

import type { FoldedNoteConfig } from "@/features/folded-note/config";
import { useBuilderStore } from "@/features/folded-note/store/builder.store";
import {
  type CreationSync,
  type SyncStatus,
  useCreationSync,
} from "@/hooks/use-creation-sync";

export type { SyncStatus };
export type FoldedNoteSync = CreationSync;

export function useFoldedNoteSync(): FoldedNoteSync {
  const doc = useBuilderStore((s) => s.doc);
  const load = useBuilderStore((s) => s.loadDoc);
  return useCreationSync<FoldedNoteConfig>({
    type: "folded-note",
    doc,
    load,
    makeTitle: (d) => d.title.trim() || "Folded Note",
  });
}
