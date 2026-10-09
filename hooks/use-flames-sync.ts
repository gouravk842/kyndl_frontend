"use client";

import type { FlamesConfig } from "@/features/flames/config";
import { useBuilderStore } from "@/features/flames/store/builder.store";
import {
  type CreationSync,
  type SyncStatus,
  useCreationSync,
} from "@/hooks/use-creation-sync";

export type { SyncStatus };
export type FlamesSync = CreationSync;

export function useFlamesSync(): FlamesSync {
  const doc = useBuilderStore((s) => s.doc);
  const load = useBuilderStore((s) => s.loadDoc);
  return useCreationSync<FlamesConfig>({
    type: "flames",
    doc,
    load,
    makeTitle: (d) => d.title.trim() || "FLAMES",
  });
}
