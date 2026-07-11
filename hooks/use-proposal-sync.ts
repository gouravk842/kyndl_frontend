"use client";

import { useProposalBuilder } from "@/features/moment/store/proposal.store";
import type { MomentDoc } from "@/features/moment/types";
import {
  type CreationSync,
  type SyncStatus,
  useCreationSync,
} from "@/hooks/use-creation-sync";

export type { SyncStatus };
export type MomentSync = CreationSync;

function momentTitle(doc: MomentDoc): string {
  return doc.question.text.trim() || "The Big Question";
}

/** Connects the Proposal builder store to the backend (see `useCreationSync`). */
export function useProposalSync(): MomentSync {
  const doc = useProposalBuilder((s) => s.doc);
  const load = useProposalBuilder((s) => s.loadDoc);
  return useCreationSync<MomentDoc>({
    type: "proposal",
    doc,
    load,
    makeTitle: momentTitle,
  });
}
