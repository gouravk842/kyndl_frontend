"use client";

import { Maximize2, X } from "lucide-react";
import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState } from "react";

import { useBuilderStore } from "../../store/builder.store";

const AlbumViewer = dynamic(
  () => import("../viewer/album-viewer").then((m) => m.AlbumViewer),
  { ssr: false },
);

// The book's aspect ratios (a leaf is 460×620). Below ~640px the viewer shows a
// single portrait page; above it, a two-page spread.
const SPREAD_AR = (2 * 460) / 620;
const PORTRAIT_AR = 460 / 620;
// Vertical room the viewer's control bar (+ gap) needs under the book.
const CONTROLS_H = 64;

/**
 * The main stage: the real, page-turning album rendered live with all of its
 * effects (flip animation, gutter shadows, sound, page corners). The book is
 * sized to fit the stage in both dimensions so it never overflows, and it turns
 * itself to whichever memory was just added or edited. A button expands it to a
 * distraction-free full screen.
 */
export function BuilderPreview({
  focusId,
  onFullscreen,
}: {
  focusId: string | null;
  onFullscreen: () => void;
}) {
  const doc = useBuilderStore((s) => s.doc);
  const assets = useBuilderStore((s) => s.assets);
  const localPreviews = useBuilderStore((s) => s.localPreviews);
  const merged = useMemo(
    () => ({ ...assets, ...localPreviews }),
    [assets, localPreviews],
  );

  // Map the focused memory to its leaf index: leaf 0 is the cover, so page i
  // sits at leaf 1 + i (see the viewer's buildAlbum).
  const goToLeaf = useMemo(() => {
    if (!focusId) return null;
    const i = doc.pages.findIndex((p) =>
      p.entries.some((e) => e.id === focusId),
    );
    return i < 0 ? null : i + 1;
  }, [focusId, doc.pages]);

  // Measure the stage and derive a book width that fits both the available
  // width and height (minus the control bar), so the preview never overflows.
  const stageRef = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState({ w: 0, h: 0 });
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const update = () => setBox({ w: el.clientWidth, h: el.clientHeight });
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const portrait = box.w > 0 && box.w < 640;
  const ar = portrait ? PORTRAIT_AR : SPREAD_AR;
  const cap = portrait ? 460 : 920;
  const availH = Math.max(0, box.h - CONTROLS_H);
  const width = Math.min(box.w, availH * ar, cap);

  return (
    <div className="relative flex min-h-0 flex-1 overflow-hidden p-4 sm:p-6">
      <button
        type="button"
        onClick={onFullscreen}
        className="absolute top-4 right-4 z-10 inline-flex items-center gap-1.5 rounded-full bg-[#3a2a25]/85 px-4 py-2 text-sm font-semibold text-white shadow-lg backdrop-blur transition-colors hover:bg-[#3a2a25]"
      >
        <Maximize2 className="size-4" /> Full screen
      </button>

      <div
        ref={stageRef}
        className="flex h-full w-full items-center justify-center"
      >
        {width > 0 && (
          <div style={{ width }}>
            <AlbumViewer
              doc={doc}
              assets={merged}
              fit="container"
              goToLeaf={goToLeaf}
            />
          </div>
        )}
      </div>
    </div>
  );
}

/** Full-screen, distraction-free flip-through of the album being built. */
export function FullscreenPreview({ onClose }: { onClose: () => void }) {
  const doc = useBuilderStore((s) => s.doc);
  const assets = useBuilderStore((s) => s.assets);
  const localPreviews = useBuilderStore((s) => s.localPreviews);
  const merged = { ...assets, ...localPreviews };

  return (
    <div className="fixed inset-0 z-[200] flex flex-col bg-[#3a281c]/92 backdrop-blur">
      <div className="flex justify-end p-4">
        <button
          type="button"
          onClick={onClose}
          className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/20"
        >
          <X className="size-4" /> Exit preview
        </button>
      </div>
      <div className="flex flex-1 items-center justify-center overflow-auto px-4 pb-8">
        <AlbumViewer doc={doc} assets={merged} />
      </div>
    </div>
  );
}
