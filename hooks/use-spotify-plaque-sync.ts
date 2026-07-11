"use client";

import type { PlaqueConfig } from "@/features/spotify-plaque/config";
import { useBuilderStore } from "@/features/spotify-plaque/store/builder.store";
import {
  type CreationSync,
  type SyncStatus,
  useCreationSync,
} from "@/hooks/use-creation-sync";

export type { SyncStatus };
export type PlaqueSync = CreationSync;

/** The card title we store for a plaque — falls back so the dashboard card
 *  never reads "Untitled". */
function plaqueTitle(doc: PlaqueConfig): string {
  const title = doc.title.trim();
  if (title) return title;
  const song = doc.songLabel.trim();
  return song ? `Plaque — ${song}` : "Spotify Plaque";
}

/** Connects the Spotify Plaque builder store to the backend (see `useCreationSync`). */
export function useSpotifyPlaqueSync(): PlaqueSync {
  const doc = useBuilderStore((s) => s.doc);
  const load = useBuilderStore((s) => s.loadDoc);
  return useCreationSync<PlaqueConfig>({
    type: "spotify-plaque",
    doc,
    load,
    makeTitle: plaqueTitle,
  });
}
