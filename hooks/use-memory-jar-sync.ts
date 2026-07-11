"use client";

import type { JarConfig } from "@/features/memory-jar/config";
import { useBuilderStore } from "@/features/memory-jar/store/builder.store";
import {
  type CreationSync,
  type SyncStatus,
  useCreationSync,
} from "@/hooks/use-creation-sync";

export type { SyncStatus };
export type MemoryJarSync = CreationSync;

/** The card title we store for a jar — falls back so the dashboard card never
 *  reads "Untitled". */
function jarTitle(doc: JarConfig): string {
  const name = doc.recipientName.trim();
  return name ? `For ${name}` : "Memory Jar";
}

/** Connects the Memory Jar builder store to the backend (see `useCreationSync`). */
export function useMemoryJarSync(): MemoryJarSync {
  const doc = useBuilderStore((s) => s.doc);
  const load = useBuilderStore((s) => s.loadDoc);
  return useCreationSync<JarConfig>({
    type: "memory-jar",
    doc,
    load,
    makeTitle: jarTitle,
  });
}
