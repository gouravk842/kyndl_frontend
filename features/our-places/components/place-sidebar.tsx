"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

import { MOOD_COLORS, type Place, PLACES } from "../config";
import { useOurPlacesStore } from "../store";

/**
 * The places index. On desktop it's a collapsible left rail listing every place
 * in chronological order; clicking one opens its memory (the map controller
 * flies there). On mobile it collapses to a horizontal scroll strip along the
 * bottom — replaced visually by the story-card bottom sheet once a memory opens.
 */
export function PlaceSidebar() {
  const activeId = useOurPlacesStore((s) => s.activeId);
  const sidebarOpen = useOurPlacesStore((s) => s.sidebarOpen);
  const openPlace = useOurPlacesStore((s) => s.openPlace);
  const toggleSidebar = useOurPlacesStore((s) => s.toggleSidebar);

  return (
    <>
      {/* ── Desktop: collapsible left rail ───────────────────────── */}
      <div className="pointer-events-none absolute top-0 left-0 z-[600] hidden h-full items-start p-4 sm:flex">
        <div
          className={[
            "pointer-events-auto flex h-full max-h-[calc(100%-1rem)] flex-col overflow-hidden rounded-2xl border border-[#f2dace]/70 bg-[#fff7f1]/80 shadow-[0_12px_36px_-18px_rgba(58,42,37,0.5)] backdrop-blur-md transition-all duration-300",
            sidebarOpen ? "w-64" : "w-12",
          ].join(" ")}
        >
          <button
            type="button"
            aria-label={sidebarOpen ? "Collapse places" : "Show places"}
            aria-expanded={sidebarOpen}
            onClick={toggleSidebar}
            className="flex shrink-0 items-center justify-between px-3 py-3 text-[#3a2a25] outline-none hover:text-[#ff7a59] focus-visible:text-[#ff7a59]"
          >
            {sidebarOpen ? (
              <span className="font-display text-sm font-semibold">
                The places
              </span>
            ) : null}
            {sidebarOpen ? (
              <ChevronLeft className="h-4 w-4" />
            ) : (
              <ChevronRight className="mx-auto h-4 w-4" />
            )}
          </button>

          {sidebarOpen ? (
            <ul className="flex-1 overflow-y-auto px-2 pb-2">
              {PLACES.map((place) => (
                <li key={place.id}>
                  <PlaceRow
                    place={place}
                    active={place.id === activeId}
                    onClick={() => openPlace(place.id)}
                  />
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>

      {/* ── Mobile: horizontal scroll strip ──────────────────────── */}
      <div
        className={[
          "scrollbar-hide pointer-events-auto absolute inset-x-0 bottom-0 z-[500] flex gap-2 overflow-x-auto px-3 pb-3 sm:hidden",
          activeId ? "hidden" : "",
        ].join(" ")}
      >
        {PLACES.map((place) => (
          <button
            key={place.id}
            type="button"
            onClick={() => openPlace(place.id)}
            className="flex shrink-0 items-center gap-2 rounded-full border border-[#f2dace]/70 bg-[#fff7f1]/85 px-3 py-2 shadow-[0_6px_18px_-10px_rgba(58,42,37,0.5)] backdrop-blur-md"
          >
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ background: MOOD_COLORS[place.mood] }}
            />
            <span className="text-xs font-medium whitespace-nowrap text-[#3a2a25]">
              {place.name}
            </span>
          </button>
        ))}
      </div>
    </>
  );
}

function PlaceRow({
  place,
  active,
  onClick,
}: {
  place: Place;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? "true" : undefined}
      className={[
        "flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left outline-none transition-colors focus-visible:ring-2 focus-visible:ring-[#ff7a59]",
        active ? "bg-[#fbd9ce]/60" : "hover:bg-[#fbeee6]/70",
      ].join(" ")}
    >
      <span
        className="mt-1 h-3 w-3 shrink-0 rounded-full border border-white shadow-sm"
        style={{ background: MOOD_COLORS[place.mood] }}
      />
      <span className="min-w-0">
        <span className="block truncate text-sm font-medium text-[#3a2a25]">
          {place.name}
        </span>
        <span className="block truncate text-xs text-[#92786c]">
          {place.city} · {place.date}
        </span>
      </span>
    </button>
  );
}
