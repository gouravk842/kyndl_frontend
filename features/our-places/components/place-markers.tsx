"use client";

import { useReducedMotion } from "framer-motion";
import L from "leaflet";
import { useEffect, useMemo, useRef } from "react";
import { Marker, useMap, useMapEvents } from "react-leaflet";

import { PLACES } from "../config";
import { flyToPlace, pinHtml } from "../lib/map-helpers";
import { useOurPlacesStore } from "../store";

/** Zoom we settle on when a memory opens. */
const FOCUS_ZOOM = 12;

/** Bucket the zoom level into the density tiers the CSS reacts to. */
function zoomBucket(zoom: number): "far" | "mid" | "near" {
  if (zoom < 6) return "far";
  if (zoom < 8) return "mid";
  return "near";
}

/**
 * Renders the pins and owns every map ↔ state reaction. Lives inside the
 * MapContainer so `useMap()` resolves the live instance.
 *
 * - Pin click / keyboard-enter → `openPlace` (single source of truth).
 * - `activeId` change → fly the map so the pin clears the story card, and toggle
 *   the open/dimmed classes directly on the pin DOM (never recreating the icon,
 *   so the entrance animation isn't replayed).
 * - Map-background click → close the open memory.
 * - Zoom → write a `data-zoom` tier onto the container for the CSS to read.
 */
export function PlaceMarkers() {
  const map = useMap();
  const reduceMotion = useReducedMotion() ?? false;
  const activeId = useOurPlacesStore((s) => s.activeId);
  const openPlace = useOurPlacesStore((s) => s.openPlace);
  const closePlace = useOurPlacesStore((s) => s.closePlace);
  const firstRun = useRef(true);

  // Icons are created once per place and never swapped (see pinHtml).
  const icons = useMemo(
    () =>
      new Map(
        PLACES.map((place, i) => [
          place.id,
          L.divIcon({
            html: pinHtml(place, i),
            className: "",
            iconSize: [0, 0],
            iconAnchor: [0, 0],
          }),
        ]),
      ),
    [],
  );

  // Background click closes; zoom changes retune the density tier.
  useMapEvents({
    click: () => closePlace(),
    zoomend: () =>
      map.getContainer().setAttribute("data-zoom", zoomBucket(map.getZoom())),
  });

  // Seed the zoom tier on mount.
  useEffect(() => {
    map.getContainer().setAttribute("data-zoom", zoomBucket(map.getZoom()));
  }, [map]);

  // React to the active place: fly + toggle pin states.
  useEffect(() => {
    const nodes = map.getContainer().querySelectorAll<HTMLElement>(".op-pin");
    nodes.forEach((el) => {
      const id = el.getAttribute("data-place-id");
      el.classList.toggle("is-active", id === activeId);
      el.classList.toggle("is-dimmed", activeId !== null && id !== activeId);
    });

    if (activeId) {
      const place = PLACES.find((p) => p.id === activeId);
      if (place) flyToPlace(map, place, FOCUS_ZOOM, reduceMotion);
    } else if (!firstRun.current) {
      // Closed — ease back out to the whole story.
      const center = L.latLng(
        PLACES.reduce((s, p) => s + p.lat, 0) / PLACES.length,
        PLACES.reduce((s, p) => s + p.lng, 0) / PLACES.length,
      );
      if (reduceMotion) map.setView(center, map.getZoom(), { animate: false });
      else map.flyTo(center, map.getZoom(), { duration: 1 });
    }
    firstRun.current = false;
  }, [activeId, map, reduceMotion]);

  return (
    <>
      {PLACES.map((place) => (
        <Marker
          key={place.id}
          position={[place.lat, place.lng]}
          icon={icons.get(place.id)}
          keyboard
          riseOnHover
          title={`${place.name}, ${place.city}`}
          eventHandlers={{ click: () => openPlace(place.id) }}
        />
      ))}
    </>
  );
}
