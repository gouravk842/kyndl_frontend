"use client";

import type { OurPlacesDoc, PlaceDoc } from "../types";
import { OurPlacesReadOnlyMap } from "./read-only-map";

/**
 * Audience-facing Our Places viewer for a *published* creation. Renders the
 * saved `OurPlacesDoc` on the shared read-only map (no editing chrome, no
 * "Exit preview"), resolving each place's photo `fileId` through the creation's
 * `assets` map (fileId → presigned URL).
 *
 * Fills its parent — `OurPlacesPublicView` owns the full-screen box and layers
 * the review / comments / chat controls on top, so this stays just the map.
 */
export function OurPlacesPublicViewer({
  content,
  assets,
}: {
  content: OurPlacesDoc;
  assets: Record<string, string>;
}) {
  const resolvePhoto = (place: PlaceDoc): string | null =>
    place.photo ? (assets[place.photo.fileId] ?? null) : null;

  return (
    <div className="relative h-full w-full bg-[#fdf3ec]">
      <OurPlacesReadOnlyMap doc={content} resolvePhoto={resolvePhoto} />
    </div>
  );
}
