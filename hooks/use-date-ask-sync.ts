"use client";

import { useDateAskBuilder } from "@/features/moment/store/date-ask.store";
import type { MomentDoc } from "@/features/moment/types";
import {
  type CreationSync,
  type SyncStatus,
  useCreationSync,
} from "@/hooks/use-creation-sync";

export type { SyncStatus };
export type MomentSync = CreationSync;

function momentTitle(doc: MomentDoc): string {
  return doc.question.text.trim() || "Will You Go Out With Me?";
}

/** Connects the Date-ask builder store to the backend (see `useCreationSync`). */
export function useDateAskSync(): MomentSync {
  const doc = useDateAskBuilder((s) => s.doc);
  const load = useDateAskBuilder((s) => s.loadDoc);
  return useCreationSync<MomentDoc>({
    type: "date-ask",
    doc,
    load,
    makeTitle: momentTitle,
  });
}
