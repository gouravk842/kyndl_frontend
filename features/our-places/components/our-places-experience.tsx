"use client";

import dynamic from "next/dynamic";

// Leaflet reads `window` the moment the map is constructed, so the map is
// client-only. `ssr: false` must live inside a Client Component (Next 16 rule) —
// the same pattern as the Memory Lane and Constellation experiences.
const OurPlacesMap = dynamic(
  () => import("./our-places-map").then((m) => m.OurPlacesMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center bg-[#fdf3ec]">
        <p className="animate-pulse font-display text-xl text-[#c75b39]">
          unfolding the map…
        </p>
      </div>
    ),
  },
);

export function OurPlacesExperience() {
  return <OurPlacesMap />;
}
