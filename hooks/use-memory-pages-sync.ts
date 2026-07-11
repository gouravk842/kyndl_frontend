"use client";

import { useBuilderStore } from "@/features/memory-pages/store/builder.store";
import type { MemoryPagesDoc } from "@/features/memory-pages/types";
import {
  type CreationSync,
  type SyncStatus,
  useCreationSync,
} from "@/hooks/use-creation-sync";

export type { SyncStatus };
export type MemoryPagesSync = CreationSync;

/** Connects the Memory Pages builder store to the backend (see `useCreationSync`). */
export function useMemoryPagesSync(): MemoryPagesSync {
  const doc = useBuilderStore((s) => s.doc);
  const load = useBuilderStore((s) => s.loadDoc);
  return useCreationSync<MemoryPagesDoc>({
    type: "memory-pages",
    doc,
    load,
    makeTitle: (content) => content.title,
  });
}
