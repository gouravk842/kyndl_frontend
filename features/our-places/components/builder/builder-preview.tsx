"use client";

import { OurPlacesReadOnlyMap } from "../read-only-map";
import { useBuilderStore } from "../../store/builder.store";
import type { PlaceDoc } from "../../types";

/**
 * Full-screen, read-only preview of the map being built — "how it looks" with
 * the real pins, photos, and memories from the builder doc. Reachable from the
 * Preview button on the builder map; the × (or Escape) returns to editing.
 *
 * The map itself is the shared {@link OurPlacesReadOnlyMap}; this only supplies
 * the builder-store data (draft doc + just-uploaded local previews) and the
 * full-screen overlay chrome.
 */
export function BuilderPreview({ onClose }: { onClose: () => void }) {
  const doc = useBuilderStore((s) => s.doc);
  const localPreviews = useBuilderStore((s) => s.localPreviews);
  const assets = useBuilderStore((s) => s.assets);

  const resolvePhoto = (place: PlaceDoc): string | null => {
    if (!place.photo) return null;
    return (
      localPreviews[place.photo.fileId] ?? assets[place.photo.fileId] ?? null
    );
  };

  return (
    <div className="fixed inset-0 z-[1000] bg-[#fdf3ec]">
      <OurPlacesReadOnlyMap doc={doc} resolvePhoto={resolvePhoto} onExit={onClose} />
    </div>
  );
}
