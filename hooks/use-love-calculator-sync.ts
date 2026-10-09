"use client";

import type { LoveCalculatorConfig } from "@/features/love-calculator/config";
import { useBuilderStore } from "@/features/love-calculator/store/builder.store";
import {
  type CreationSync,
  type SyncStatus,
  useCreationSync,
} from "@/hooks/use-creation-sync";

export type { SyncStatus };
export type LoveCalculatorSync = CreationSync;

export function useLoveCalculatorSync(): LoveCalculatorSync {
  const doc = useBuilderStore((s) => s.doc);
  const load = useBuilderStore((s) => s.loadDoc);
  return useCreationSync<LoveCalculatorConfig>({
    type: "love-calculator",
    doc,
    load,
    makeTitle: (d) => d.title.trim() || "Love Calculator",
  });
}
