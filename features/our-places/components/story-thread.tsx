"use client";

import type { Polyline as LeafletPolyline } from "leaflet";
import { useEffect, useRef } from "react";
import { Polyline } from "react-leaflet";

import { type Place, PLACES } from "../config";
import { useOurPlacesStore } from "../store";

/**
 * The ink thread that draws itself across the map during Story Mode — one
 * segment per leg of the journey, revealed as each new place is reached. Lives
 * inside the MapContainer so the polylines mount onto the live map. In free-roam
 * (storyIndex null) it renders nothing.
 *
 * Each leg is its own <Segment> so only the newest one animates its draw; earlier
 * legs stay solid. The draw is done with the SVG `pathLength="1"` trick: setting
 * it normalises the path length to 1, so a `stroke-dasharray: 1` covers the whole
 * leg regardless of its real pixel length and `stroke-dashoffset: 1 → 0` reveals
 * it edge-to-edge (see `.op-thread--draw` in our-places.css).
 */
export function StoryThread() {
  const storyIndex = useOurPlacesStore((s) => s.storyIndex);
  if (storyIndex === null) return null;

  // Legs connecting the places visited so far (0..min(storyIndex, N-1)).
  const legCount = Math.min(storyIndex, PLACES.length - 1);
  const legs: Array<{ from: Place; to: Place; newest: boolean }> = [];
  for (let i = 0; i < legCount; i++) {
    const from = PLACES[i];
    const to = PLACES[i + 1];
    if (from && to) legs.push({ from, to, newest: i === legCount - 1 });
  }

  return (
    <>
      {legs.map(({ from, to, newest }) => (
        <Segment
          key={`${from.id}->${to.id}`}
          from={from}
          to={to}
          animate={newest}
        />
      ))}
    </>
  );
}

function Segment({
  from,
  to,
  animate,
}: {
  from: Place;
  to: Place;
  animate: boolean;
}) {
  const ref = useRef<LeafletPolyline | null>(null);

  useEffect(() => {
    const el = ref.current?.getElement() as SVGPathElement | undefined;
    if (!el) return;
    // Normalise so the dash math is length-independent, then trigger the draw on
    // the freshly-added leg only.
    el.setAttribute("pathLength", "1");
    if (animate) el.classList.add("op-thread--draw");
  }, [animate]);

  return (
    <Polyline
      ref={ref}
      positions={[
        [from.lat, from.lng],
        [to.lat, to.lng],
      ]}
      interactive={false}
      pathOptions={{
        className: "op-thread",
        color: "#c75b39",
        weight: 2,
        opacity: 0.75,
        lineCap: "round",
        lineJoin: "round",
      }}
    />
  );
}
