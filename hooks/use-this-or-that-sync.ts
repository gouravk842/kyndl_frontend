"use client";

import type { ThisOrThatConfig } from "@/features/this-or-that/config";
import { useBuilderStore } from "@/features/this-or-that/store/builder.store";
import {
  type CreationSync,
  type SyncStatus,
  useCreationSync,
} from "@/hooks/use-creation-sync";

export type { SyncStatus };
export type ThisOrThatSync = CreationSync;

export function useThisOrThatSync(): ThisOrThatSync {
  const doc = useBuilderStore((s) => s.doc);
  const load = useBuilderStore((s) => s.loadDoc);
  return useCreationSync<ThisOrThatConfig>({
    type: "this-or-that",
    doc,
    load,
    makeTitle: (d) => d.title.trim() || "This or That",
  });
}
