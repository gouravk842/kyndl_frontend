"use client";

import type { StringFrameConfig } from "@/features/string-frame/config";
import { useBuilderStore } from "@/features/string-frame/store/builder.store";
import {
  type CreationSync,
  type SyncStatus,
  useCreationSync,
} from "@/hooks/use-creation-sync";

export type { SyncStatus };
export type StringFrameSync = CreationSync;

/** The card title we store for a string frame — falls back so the dashboard
 *  card never reads "Untitled". */
function frameTitle(doc: StringFrameConfig): string {
  const name = doc.name.trim();
  return name ? `${name}'s frame` : "String Frame";
}

/** Connects the String Frame builder store to the backend (see `useCreationSync`). */
export function useStringFrameSync(): StringFrameSync {
  const doc = useBuilderStore((s) => s.doc);
  const load = useBuilderStore((s) => s.loadDoc);
  return useCreationSync<StringFrameConfig>({
    type: "string-frame",
    doc,
    load,
    makeTitle: frameTitle,
  });
}
