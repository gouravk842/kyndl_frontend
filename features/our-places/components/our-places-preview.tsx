"use client";

import dynamic from "next/dynamic";

// Leaflet reads `window` on construction, so the postcard is client-only.
// `ssr: false` must live inside a Client Component (Next 16 rule) — the same
// pattern as `our-places-experience.tsx`.
const OurPlacesPreviewMap = dynamic(
  () => import("./our-places-preview-map").then((m) => m.OurPlacesPreviewMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center bg-[#fdf3ec]">
        <p className="animate-pulse font-display text-lg text-[#c75b39]">
          unfolding the map…
        </p>
      </div>
    ),
  },
);

/**
 * Inline product-page preview of Our Places — a non-interactive "living
 * postcard". Distinct from `OurPlacesExperience` (the full, interactive map at
 * the standalone route, reached via "Open full screen").
 */
export function OurPlacesPreview() {
  return <OurPlacesPreviewMap />;
}
