"use client";

import { MAP_CONFIG, PLACES } from "../config";

/**
 * The floating title pill, overlaid at the top of the map. The map itself is the
 * UI, so this is the only chrome — a quiet glass pill, not a navbar.
 */
export function MapHeader() {
  return (
    <div className="pointer-events-none absolute top-4 left-1/2 z-[600] -translate-x-1/2">
      <div className="flex items-center gap-2 rounded-full border border-[#f2dace]/70 bg-[#fff7f1]/70 px-4 py-2 shadow-[0_8px_24px_-12px_rgba(58,42,37,0.4)] backdrop-blur-md">
        <span className="font-display text-sm font-semibold text-[#3a2a25] sm:text-base">
          {MAP_CONFIG.title}
        </span>
        <span className="hidden text-[#c9b3a6] sm:inline">·</span>
        <span className="hidden text-xs text-[#92786c] sm:inline">
          {MAP_CONFIG.subtitle}
        </span>
        <span className="ml-1 rounded-full bg-[#fbd9ce] px-2 py-0.5 text-[11px] font-semibold text-[#72243e]">
          {PLACES.length} places
        </span>
      </div>
    </div>
  );
}
