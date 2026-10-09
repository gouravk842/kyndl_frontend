"use client";

import type { MirrorContent } from "@/features/mirror-match/config";
import { useBuilderStore } from "@/features/mirror-match/store/builder.store";
import {
  type CreationSync,
  type SyncStatus,
  useCreationSync,
} from "@/hooks/use-creation-sync";

export type { SyncStatus };
export type MirrorMatchSync = CreationSync;

function mirrorTitle(doc: MirrorContent): string {
  const name = doc.recipientName.trim();
  return name ? `Mirror Match for ${name}` : "Mirror Match";
}

/** Connects the Mirror Match builder store to the backend (see `useCreationSync`). */
export function useMirrorMatchSync(): MirrorMatchSync {
  const doc = useBuilderStore((s) => s.doc);
  const load = useBuilderStore((s) => s.loadDoc);
  return useCreationSync<MirrorContent>({
    type: "mirror-match",
    doc,
    load,
    makeTitle: mirrorTitle,
  });
}
