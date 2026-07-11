"use client";

import dynamic from "next/dynamic";

// The builder relies on localStorage (persisted draft), ResizeObserver, and the
// DOM-only flip engine, so it's mounted client-only. `ssr: false` must live in
// a Client Component (Next 16 rule).
const ScrapbookBuilder = dynamic(
  () => import("./scrapbook-builder").then((m) => m.ScrapbookBuilder),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[60vh] items-center justify-center">
        <p className="animate-pulse font-cursive text-2xl text-[#C75B39]">
          opening your workshop…
        </p>
      </div>
    ),
  },
);

export function BuilderExperience() {
  return <ScrapbookBuilder />;
}
