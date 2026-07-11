"use client";

import { useBuilderStore } from "@/features/our-places/store/builder.store";
import type { OurPlacesDoc } from "@/features/our-places/types";
import {
  type CreationSync,
  type SyncStatus,
  useCreationSync,
} from "@/hooks/use-creation-sync";

export type { SyncStatus };
export type OurPlacesSync = CreationSync;

/** Connects the Our Places builder store to the backend (see `useCreationSync`). */
export function useOurPlacesSync(): OurPlacesSync {
  const doc = useBuilderStore((s) => s.doc);
  const load = useBuilderStore((s) => s.loadDoc);
  return useCreationSync<OurPlacesDoc>({
    type: "our-places",
    doc,
    load,
    makeTitle: (content) => content.map.title,
  });
}
