"use client";

import dynamic from "next/dynamic";

// The gallery renders live ScrapbookPage previews (ResizeObserver + TipTap
// static render), which are DOM-only — so it's client-only. `ssr: false` must
// live inside a Client Component (Next 16 rule).
const TemplatesGallery = dynamic(
  () => import("./templates-gallery").then((m) => m.TemplatesGallery),
  {
    ssr: false,
    loading: () => (
      <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="aspect-[460/620] animate-pulse rounded-2xl border border-[#F2DACE] bg-[#f3e9dd]"
          />
        ))}
      </div>
    ),
  },
);

export function ScrapbookTemplatesShowcase() {
  return <TemplatesGallery />;
}
