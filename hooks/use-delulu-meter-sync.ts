"use client";

import type { DeluluMeterConfig } from "@/features/delulu-meter/config";
import { useBuilderStore } from "@/features/delulu-meter/store/builder.store";
import {
  type CreationSync,
  type SyncStatus,
  useCreationSync,
} from "@/hooks/use-creation-sync";

export type { SyncStatus };
export type DeluluMeterSync = CreationSync;

export function useDeluluMeterSync(): DeluluMeterSync {
  const doc = useBuilderStore((s) => s.doc);
  const load = useBuilderStore((s) => s.loadDoc);
  return useCreationSync<DeluluMeterConfig>({
    type: "delulu-meter",
    doc,
    load,
    makeTitle: (d) => d.title.trim() || "Delulu Meter",
  });
}
