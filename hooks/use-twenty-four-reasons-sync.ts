"use client";

import type { TwentyFourReasonsContent } from "@/features/twenty-four-reasons/config";
import { useBuilderStore } from "@/features/twenty-four-reasons/store/builder.store";
import {
  type CreationSync,
  type SyncStatus,
  useCreationSync,
} from "@/hooks/use-creation-sync";

export type { SyncStatus };
export type TwentyFourReasonsSync = CreationSync;

function reasonsTitle(doc: TwentyFourReasonsContent): string {
  const name = doc.recipientName.trim();
  return name ? `24 Reasons for ${name}` : "24 Reasons";
}

/** Connects the 24 Reasons builder store to the backend (see `useCreationSync`). */
export function useTwentyFourReasonsSync(): TwentyFourReasonsSync {
  const doc = useBuilderStore((s) => s.doc);
  const load = useBuilderStore((s) => s.loadDoc);
  return useCreationSync<TwentyFourReasonsContent>({
    type: "twenty-four-reasons",
    doc,
    load,
    makeTitle: reasonsTitle,
  });
}
