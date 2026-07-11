"use client";

import dynamic from "next/dynamic";

import type { MemoryPagesDoc } from "../types";

// react-pageflip touches the DOM on mount, so the album is client-only.
// `ssr: false` must live inside a Client Component (Next 16 rule).
const AlbumViewer = dynamic(
  () => import("./viewer/album-viewer").then((m) => m.AlbumViewer),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[620px] items-center justify-center">
        <p className="animate-pulse font-cursive text-2xl text-[#C75B39]">
          opening the album…
        </p>
      </div>
    ),
  },
);

export function MemoryPagesExperience({
  doc,
  assets,
  autoPlay,
  fit,
}: {
  doc?: MemoryPagesDoc;
  assets?: Record<string, string>;
  /** Turn pages on their own (pauses while hovered/focused). */
  autoPlay?: boolean;
  /** "viewport" (default) sizes the book to the screen; "container" fits it to
   *  its parent, for side-by-side layouts. */
  fit?: "viewport" | "container";
}) {
  return (
    <AlbumViewer doc={doc} assets={assets} autoPlay={autoPlay} fit={fit} />
  );
}
