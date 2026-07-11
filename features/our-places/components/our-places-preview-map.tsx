"use client";

import "leaflet/dist/leaflet.css";
import "../our-places.css";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import L from "leaflet";
import { useEffect, useMemo, useState } from "react";
import {
  MapContainer,
  Marker,
  Polyline,
  TileLayer,
  useMap,
} from "react-leaflet";

import { MAP_CONFIG, MOOD_COLORS, PLACES } from "../config";
import { pinHtml } from "../lib/map-helpers";

/** How long each memory lingers in the cycling card. */
const DWELL_MS = 3600;
/** Don't zoom in past this when framing the pins — keeps several visible. */
const FRAME_MAX_ZOOM = 6;

/**
 * The "living postcard" — a non-interactive trailer of the experience for the
 * product page's hero. It is NOT the real map: every Leaflet interaction is
 * locked off and the whole thing is `pointer-events-none`, so it reads as a
 * picture, not an app. The job is to communicate the idea at a glance — places
 * on a map, each one a memory — via three quiet loops: pins fade in, a faint
 * thread is drawn between them, and one memory card cross-fades through the
 * places while its pin lights up in sync. "Open full screen" launches the real,
 * interactive map (the standalone route).
 */
export function OurPlacesPreviewMap() {
  const reduceMotion = useReducedMotion() ?? false;
  const [activeIndex, setActiveIndex] = useState(0);

  // Cross-fade through the places. Reduced motion holds on the first one.
  useEffect(() => {
    if (reduceMotion) return;
    const id = setInterval(
      () => setActiveIndex((i) => (i + 1) % PLACES.length),
      DWELL_MS,
    );
    return () => clearInterval(id);
  }, [reduceMotion]);

  const active = PLACES[activeIndex] ?? PLACES[0];
  if (!active) return null; // no places configured — nothing to preview

  return (
    <div className="op-map op-preview pointer-events-none relative h-full w-full select-none">
      <MapContainer
        className="op-map"
        center={[MAP_CONFIG.centerLat, MAP_CONFIG.centerLng]}
        zoom={MAP_CONFIG.defaultZoom}
        zoomControl={false}
        attributionControl
        // Fully locked — this is a picture, not an interactive map.
        dragging={false}
        scrollWheelZoom={false}
        doubleClickZoom={false}
        touchZoom={false}
        boxZoom={false}
        keyboard={false}
      >
        <TileLayer
          url={MAP_CONFIG.tiles.url}
          attribution={MAP_CONFIG.tiles.attribution}
          {...(MAP_CONFIG.tiles.subdomains
            ? { subdomains: MAP_CONFIG.tiles.subdomains }
            : {})}
          minZoom={MAP_CONFIG.tiles.minZoom}
          maxZoom={MAP_CONFIG.tiles.maxZoom}
        />
        {/* The faint thread "drawn across the map", connecting places in order. */}
        <Polyline
          positions={PLACES.map((p) => [p.lat, p.lng])}
          pathOptions={{
            color: "#d8784f",
            weight: 1.5,
            opacity: 0.35,
            dashArray: "1 9",
            lineCap: "round",
            lineJoin: "round",
            className: "op-preview-line",
          }}
          interactive={false}
        />
        <PreviewPins activeId={active.id} />
        <FrameToPins />
      </MapContainer>

      {/* Soft top-down wash so the warm hero bleeds into the map edges. */}
      <div
        className="pointer-events-none absolute inset-0 z-[500]"
        style={{
          background:
            "radial-gradient(120% 80% at 50% 0%, transparent 55%, rgba(253,243,236,0.55) 100%)",
        }}
        aria-hidden
      />

      {/* The cycling memory card — the emotional payload, no photo required. */}
      <div className="absolute bottom-4 left-4 z-[600] w-[min(72%,17rem)]">
        <AnimatePresence mode="wait">
          <motion.div
            key={active.id}
            initial={reduceMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-start gap-3 rounded-2xl border border-[#f2dace]/80 bg-[#fffaf4]/85 p-3.5 shadow-[0_14px_36px_-18px_rgba(58,42,37,0.55)] backdrop-blur-md"
          >
            <span
              className="mt-0.5 grid size-10 shrink-0 place-items-center rounded-xl text-[11px] font-bold text-white shadow-inner"
              style={{
                background: `linear-gradient(135deg, ${MOOD_COLORS[active.mood]}, color-mix(in srgb, ${MOOD_COLORS[active.mood]} 60%, #fff))`,
              }}
              aria-hidden
            >
              {activeIndex + 1}
            </span>
            <span className="min-w-0">
              <span className="block font-hand text-lg leading-tight text-[#c75b39]">
                {active.title}
              </span>
              <span className="mt-0.5 block truncate text-[11px] font-medium text-[#7a6258]">
                {active.name} · {active.city}
              </span>
            </span>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

/** Frames the map on the actual pins once, after the container has measured. */
function FrameToPins() {
  const map = useMap();
  useEffect(() => {
    const bounds = L.latLngBounds(PLACES.map((p) => [p.lat, p.lng]));
    map.fitBounds(bounds, { padding: [38, 38], maxZoom: FRAME_MAX_ZOOM });
  }, [map]);
  return null;
}

/** Renders the glowing pins and lights up whichever the card is showing. */
function PreviewPins({ activeId }: { activeId: string }) {
  const map = useMap();

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

  // Toggle the active glow on the matching pin DOM node — same imperative
  // approach as the real map, so the icon is never recreated mid-animation.
  useEffect(() => {
    const nodes = map.getContainer().querySelectorAll<HTMLElement>(".op-pin");
    nodes.forEach((el) => {
      el.classList.toggle(
        "is-active",
        el.getAttribute("data-place-id") === activeId,
      );
    });
  }, [activeId, map]);

  return (
    <>
      {PLACES.map((place) => (
        <Marker
          key={place.id}
          position={[place.lat, place.lng]}
          icon={icons.get(place.id)}
          interactive={false}
          keyboard={false}
        />
      ))}
    </>
  );
}
