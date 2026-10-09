"use client";

import { useBuilderStore } from "@/features/relationship-calendar/store/builder.store";
import type { RelationshipCalendarDoc } from "@/features/relationship-calendar/types";
import {
  type CreationSync,
  type SyncStatus,
  useCreationSync,
} from "@/hooks/use-creation-sync";

export type { SyncStatus };
export type RelationshipCalendarSync = CreationSync;

/** Connects the Relationship Calendar builder store to the backend. */
export function useRelationshipCalendarSync(): RelationshipCalendarSync {
  const doc = useBuilderStore((s) => s.doc);
  const load = useBuilderStore((s) => s.loadDoc);
  return useCreationSync<RelationshipCalendarDoc>({
    type: "relationship-calendar",
    doc,
    load,
    makeTitle: (content) => content.title || "Our Calendar",
  });
}
