"use client";

import { useBuilderStore } from "@/features/scrapbook/store/builder.store";
import type { ScrapbookStory } from "@/features/scrapbook/types";
import {
  type CreationSync,
  type SyncStatus,
  useCreationSync,
} from "@/hooks/use-creation-sync";

export type { SyncStatus };
export type ScrapbookSync = CreationSync;

/** Connects the scrapbook builder store to the backend (see `useCreationSync`). */
export function useScrapbookSync(): ScrapbookSync {
  const story = useBuilderStore((s) => s.story);
  const load = useBuilderStore((s) => s.loadStory);
  return useCreationSync<ScrapbookStory>({
    type: "scrapbook",
    doc: story,
    load,
    makeTitle: (content) => content.title,
  });
}
