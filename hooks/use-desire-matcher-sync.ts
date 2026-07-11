"use client";

import type { MatcherContent } from "@/features/desire-matcher/config";
import { useBuilderStore } from "@/features/desire-matcher/store/builder.store";
import {
  type CreationSync,
  type SyncStatus,
  useCreationSync,
} from "@/hooks/use-creation-sync";

export type { SyncStatus };
export type DesireMatcherSync = CreationSync;

function matcherTitle(doc: MatcherContent): string {
  const name = doc.recipientName.trim();
  return name ? `Matcher for ${name}` : "Desire Matcher";
}

/** Connects the Desire Matcher builder store to the backend (see `useCreationSync`). */
export function useDesireMatcherSync(): DesireMatcherSync {
  const doc = useBuilderStore((s) => s.doc);
  const load = useBuilderStore((s) => s.loadDoc);
  return useCreationSync<MatcherContent>({
    type: "desire-matcher",
    doc,
    load,
    makeTitle: matcherTitle,
  });
}
