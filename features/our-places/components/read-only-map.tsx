"use client";

import "leaflet/dist/leaflet.css";
import "../our-places.css";

import L from "leaflet";
import { MapPin, Pause, Play, SkipBack, SkipForward, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { MapContainer, Marker, Polyline, TileLayer, useMap } from "react-leaflet";

import { CATEGORY_META, MOOD_COLORS, type Place, TILE_STYLES } from "../config";
import { pinHtml } from "../lib/map-helpers";
import type { OurPlacesDoc, PlaceDoc } from "../types";

const FRAME_MAX_ZOOM = 8;
/** How long each place holds on screen before the tour auto-advances. */
const TOUR_SCENE_MS = 5200;

/** `pinHtml` wants a `Place`; a `PlaceDoc` matches every field it reads. */
function asPlace(p: PlaceDoc): Place {
  return { ...p, photo: undefined };
}

/**
 * Read-only render of an `OurPlacesDoc` — the pins, memory cards, framed map,
 * and a guided tour (play/pause, prev/next) that flies place-to-place revealing
 * each memory. No editing affordances. Shared by the builder's "Preview" overlay
 * (which passes `onExit`) and the audience-facing public viewer (which doesn't).
 * Purely presentational: the caller resolves a place's photo to a URL, so this
 * stays free of the builder's persisted store and of the public `assets` map.
 *
 * The caller owns the outer sizing box (fixed overlay vs. in-flow full height);
 * this fills it.
 */
export function OurPlacesReadOnlyMap({
  doc,
  resolvePhoto,
  onExit,
}: {
  doc: OurPlacesDoc;
  resolvePhoto: (place: PlaceDoc) => string | null;
  /** When set, an "Exit preview" button and Escape-to-close are shown. */
  onExit?: () => void;
}) {
  const places = doc.places;
  const [activeId, setActiveId] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);

  const tiles = TILE_STYLES[doc.map.tileStyle] ?? TILE_STYLES.positron;
  const active = places.find((p) => p.id === activeId) ?? null;
  const activeIndex = active ? places.findIndex((p) => p.id === active.id) : -1;
  const hasTour = places.length > 1;
  const flyZoom = Math.min(6, tiles.maxZoom);

  const openAt = (i: number) => {
    const place = places[i];
    if (place) setActiveId(place.id);
  };
  const goNext = () => {
    const i = activeIndex < 0 ? 0 : activeIndex + 1;
    if (i >= places.length) {
      setPlaying(false);
      return;
    }
    openAt(i);
  };
  const goPrev = () => openAt(Math.max(0, (activeIndex < 0 ? 0 : activeIndex) - 1));
  const togglePlay = () => {
    if (playing) {
      setPlaying(false);
      return;
    }
    // Start fresh from the first place when nothing is selected or the tour has
    // already reached the last place (so replaying from the end doesn't dead-end).
    if (activeIndex < 0 || activeIndex >= places.length - 1) openAt(0);
    setPlaying(true);
  };
  // A manual pin/card interaction always drops out of the tour.
  const selectPlace = (id: string) => {
    setPlaying(false);
    setActiveId(id);
  };
  const closeCard = () => {
    setPlaying(false);
    setActiveId(null);
  };

  // Auto-advance while playing; the timer resets whenever the scene changes.
  useEffect(() => {
    if (!playing || activeIndex < 0) return;
    const t = setTimeout(() => {
      const i = activeIndex + 1;
      if (i >= places.length) {
        setPlaying(false);
        return;
      }
      const place = places[i];
      if (place) setActiveId(place.id);
    }, TOUR_SCENE_MS);
    return () => clearTimeout(t);
  }, [playing, activeIndex, places]);

  // Close on Escape (only meaningful for the builder's overlay).
  useEffect(() => {
    if (!onExit) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onExit();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onExit]);

  return (
    <div className="op-map relative h-full w-full overflow-hidden">
      {places.length > 0 ? (
        <MapContainer
          className="op-map"
          center={[doc.map.centerLat, doc.map.centerLng]}
          zoom={doc.map.defaultZoom}
          minZoom={tiles.minZoom}
          maxZoom={tiles.maxZoom}
          zoomControl={false}
          attributionControl
          scrollWheelZoom
        >
          <TileLayer
            url={tiles.url}
            attribution={tiles.attribution}
            {...(tiles.subdomains ? { subdomains: tiles.subdomains } : {})}
            minZoom={tiles.minZoom}
            maxZoom={tiles.maxZoom}
          />
          <Polyline
            positions={places.map((p) => [p.lat, p.lng])}
            pathOptions={{
              color: "#d8784f",
              weight: 1.5,
              opacity: 0.35,
              dashArray: "1 9",
              lineCap: "round",
              lineJoin: "round",
            }}
            interactive={false}
          />
          <PreviewPins places={places} activeId={activeId} onSelect={selectPlace} />
          <TourCamera active={active} places={places} flyZoom={flyZoom} />
        </MapContainer>
      ) : (
        <div className="flex h-full w-full items-center justify-center px-6 text-center">
          <p className="font-display text-lg text-[#92786c]">
            Add a place to see your map come to life.
          </p>
        </div>
      )}

      {/* Header */}
      <div className="pointer-events-none absolute top-0 left-0 z-[600] p-5 sm:p-7">
        <h1 className="font-display text-2xl text-[#3a2a25] sm:text-3xl">
          {doc.map.title || "Our Places"}
        </h1>
        {doc.map.subtitle && (
          <p className="mt-1 font-hand text-lg text-[#c75b39]">{doc.map.subtitle}</p>
        )}
        <p className="mt-1 text-xs font-medium tracking-wide text-[#92786c] uppercase">
          {places.length} {places.length === 1 ? "place" : "places"}
        </p>
      </div>

      {/* Exit preview (builder overlay only) */}
      {onExit && (
        <button
          type="button"
          onClick={onExit}
          className="absolute top-5 right-5 z-[700] inline-flex items-center gap-1.5 rounded-full bg-[#3a2a25]/85 px-4 py-2 text-sm font-semibold text-white shadow-lg backdrop-blur transition-colors hover:bg-[#3a2a25]"
        >
          <X className="size-4" /> Exit preview
        </button>
      )}

      {/* Memory card — lifts above the tour bar on mobile so the two don't stack. */}
      {active && (
        <div
          className={[
            "absolute inset-x-0 z-[650] p-4 sm:inset-x-auto sm:top-1/2 sm:right-6 sm:bottom-auto sm:w-[360px] sm:-translate-y-1/2 sm:p-0",
            hasTour ? "bottom-24 sm:bottom-auto" : "bottom-0",
          ].join(" ")}
        >
          <PreviewCard
            place={active}
            photo={resolvePhoto(active)}
            onClose={closeCard}
          />
        </div>
      )}

      {/* Guided tour controls */}
      {hasTour && (
        <TourBar
          index={activeIndex}
          total={places.length}
          playing={playing}
          onPrev={goPrev}
          onToggle={togglePlay}
          onNext={goNext}
        />
      )}
    </div>
  );
}

/** The bottom-centre playback bar for the guided tour. */
function TourBar({
  index,
  total,
  playing,
  onPrev,
  onToggle,
  onNext,
}: {
  index: number;
  total: number;
  playing: boolean;
  onPrev: () => void;
  onToggle: () => void;
  onNext: () => void;
}) {
  const started = index >= 0;
  return (
    <div className="absolute bottom-5 left-1/2 z-[660] w-[min(92vw,22rem)] -translate-x-1/2">
      <div className="flex items-center justify-between gap-2 rounded-2xl border border-[#f2dace]/70 bg-[#fff7f1]/85 px-3 py-2.5 shadow-[0_16px_44px_-18px_rgba(58,42,37,0.6)] backdrop-blur-md">
        <span className="w-16 pl-1 text-[11px] font-semibold tracking-wide text-[#92786c] tabular-nums">
          {started ? `${index + 1} / ${total}` : `Tour · ${total}`}
        </span>
        <div className="flex items-center gap-1.5">
          <TourButton
            label="Previous place"
            onClick={onPrev}
            disabled={started && index === 0}
          >
            <SkipBack className="size-4" />
          </TourButton>
          <button
            type="button"
            aria-label={playing ? "Pause tour" : "Play tour"}
            onClick={onToggle}
            className="grid size-10 place-items-center rounded-full bg-gradient-to-r from-[#ff7a59] to-[#f2596f] text-white shadow-md outline-none transition-transform hover:scale-105 focus-visible:ring-2 focus-visible:ring-[#ff7a59]"
          >
            {playing ? (
              <Pause className="size-4 fill-current" />
            ) : (
              <Play className="size-4 translate-x-px fill-current" />
            )}
          </button>
          <TourButton label="Next place" onClick={onNext}>
            <SkipForward className="size-4" />
          </TourButton>
        </div>
        <span className="w-16" aria-hidden />
      </div>
    </div>
  );
}

function TourButton({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className="grid size-9 place-items-center rounded-full text-[#6b5246] outline-none transition-colors hover:bg-[#fbeee6] hover:text-[#c75b39] focus-visible:ring-2 focus-visible:ring-[#ff7a59] disabled:opacity-30 disabled:hover:bg-transparent"
    >
      {children}
    </button>
  );
}

function PreviewCard({
  place,
  photo,
  onClose,
}: {
  place: PlaceDoc;
  photo: string | null;
  onClose: () => void;
}) {
  const cat = CATEGORY_META[place.category];
  return (
    <div className="overflow-hidden rounded-2xl border border-[#f2dace] bg-[#fffaf4] shadow-[0_24px_60px_-24px_rgba(58,42,37,0.6)]">
      {photo && (
        <div className="relative h-44 w-full">
          {/* eslint-disable-next-line @next/next/no-img-element -- presigned URL */}
          <img src={photo} alt="" className="h-full w-full object-cover" />
        </div>
      )}
      <div className="space-y-2.5 p-5">
        <div className="flex items-center justify-between gap-2">
          <span
            className="inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold"
            style={{ background: cat.badgeBg, color: cat.badgeText }}
          >
            {cat.label}
          </span>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="grid size-7 place-items-center rounded-full text-[#92786c] hover:bg-[#fbeee6] hover:text-[#c75b39]"
          >
            <X className="size-4" />
          </button>
        </div>

        {place.title && (
          <h2 className="font-hand text-2xl leading-tight text-[#c75b39]">
            {place.title}
          </h2>
        )}

        <p className="flex items-center gap-1.5 text-sm font-medium text-[#3a2a25]">
          <span
            className="size-2.5 rounded-full"
            style={{ background: MOOD_COLORS[place.mood] }}
          />
          {place.name}
          {place.city ? (
            <span className="text-[#92786c]">
              · {place.city}
              {place.country ? `, ${place.country}` : ""}
            </span>
          ) : null}
        </p>

        {place.date && (
          <p className="flex items-center gap-1.5 text-xs text-[#92786c]">
            <MapPin className="size-3.5 shrink-0" />
            {place.date}
          </p>
        )}

        {place.memory && (
          <p className="pt-1 text-sm leading-relaxed whitespace-pre-line text-[#5c463d]">
            {place.memory}
          </p>
        )}
      </div>
    </div>
  );
}

/** Top-down paper airplane, pointing due north (0°) so it can be rotated to any
 *  heading. Warm fill + white edge so it reads on both cream and illustrated tiles. */
const PLANE_SVG =
  '<svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true">' +
  '<path d="M12 2c.5 0 .9.4 1.1 1l1.2 7.2 6.9 4.1c.3.2.5.5.5.9v1c0 .3-.3.6-.7.5l-6.8-2 .1 4.3 1.8 1.4c.2.1.3.3.3.5v.6c0 .3-.3.5-.6.4L12 21.4l-3.4 1c-.3.1-.6-.1-.6-.4v-.6c0-.2.1-.4.3-.5l1.8-1.4.1-4.3-6.8 2c-.4.1-.7-.2-.7-.5v-1c0-.4.2-.7.5-.9l6.9-4.1L10.9 3c.2-.6.6-1 1.1-1z" ' +
  'fill="#c75b39" stroke="#fffaf4" stroke-width="0.6" stroke-linejoin="round"/></svg>';

/** Planar heading A→B in degrees clockwise from north (good enough at map scale). */
function planarBearing(a: PlaceDoc, b: PlaceDoc): number {
  const dLng =
    (b.lng - a.lng) * Math.cos((((a.lat + b.lat) / 2) * Math.PI) / 180);
  const dLat = b.lat - a.lat;
  return (Math.atan2(dLng, dLat) * 180) / Math.PI;
}

function easeInOut(t: number): number {
  return t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2;
}

function planeIcon(bearingDeg: number): L.DivIcon {
  return L.divIcon({
    className: "",
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    html:
      `<div style="transform: rotate(${bearingDeg}deg); ` +
      `filter: drop-shadow(0 3px 4px rgba(58,42,37,0.45));">${PLANE_SVG}</div>`,
  });
}

/**
 * Drives the camera and the little plane between places. Opening a place from
 * free-roam just flies there; moving place-to-place frames both endpoints and
 * sends a plane along the route, rotated to its heading. Framing the whole route
 * again when nothing is selected (initial mount, card close, tour end).
 */
function TourCamera({
  active,
  places,
  flyZoom,
}: {
  active: PlaceDoc | null;
  places: PlaceDoc[];
  flyZoom: number;
}) {
  const map = useMap();
  const prevRef = useRef<PlaceDoc | null>(null);
  const planeRef = useRef<L.Marker | null>(null);
  const rafRef = useRef(0);

  useEffect(() => {
    const prev = prevRef.current;
    prevRef.current = active;

    // Clear any flight already in progress (e.g. rapid next-clicks).
    cancelAnimationFrame(rafRef.current);
    if (planeRef.current) {
      planeRef.current.remove();
      planeRef.current = null;
    }

    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (active && prev && prev.id !== active.id && !reduceMotion) {
      // A hop between two places → frame both ends and fly a plane across.
      const a = prev;
      const b = active;
      map.fitBounds(
        L.latLngBounds([
          [a.lat, a.lng],
          [b.lat, b.lng],
        ]),
        { padding: [90, 90], maxZoom: flyZoom, animate: true, duration: 0.8 },
      );

      const plane = L.marker([a.lat, a.lng], {
        icon: planeIcon(planarBearing(a, b)),
        interactive: false,
        keyboard: false,
        zIndexOffset: 1000,
      }).addTo(map);
      planeRef.current = plane;

      const DURATION = 1500;
      const start = performance.now();
      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / DURATION);
        const e = easeInOut(t);
        plane.setLatLng([a.lat + (b.lat - a.lat) * e, a.lng + (b.lng - a.lng) * e]);
        if (t < 1) {
          rafRef.current = requestAnimationFrame(tick);
        } else {
          plane.remove();
          planeRef.current = null;
        }
      };
      rafRef.current = requestAnimationFrame(tick);
    } else if (active) {
      map.flyTo([active.lat, active.lng], flyZoom, { duration: 1.1 });
    } else if (places.length) {
      const bounds = L.latLngBounds(places.map((p) => [p.lat, p.lng]));
      map.fitBounds(bounds, { padding: [60, 60], maxZoom: FRAME_MAX_ZOOM });
    }

    return () => cancelAnimationFrame(rafRef.current);
  }, [active, map, places, flyZoom]);

  // Tidy up the plane if the map unmounts mid-flight.
  useEffect(
    () => () => {
      if (planeRef.current) planeRef.current.remove();
    },
    [],
  );

  return null;
}

/** Glowing, clickable pins; the active one lights up. */
function PreviewPins({
  places,
  activeId,
  onSelect,
}: {
  places: PlaceDoc[];
  activeId: string | null;
  onSelect: (id: string) => void;
}) {
  const map = useMap();

  const icons = useMemo(
    () =>
      new Map(
        places.map((place, i) => [
          place.id,
          L.divIcon({
            html: pinHtml(asPlace(place), i),
            className: "",
            iconSize: [0, 0],
            iconAnchor: [0, 0],
          }),
        ]),
      ),
    [places],
  );

  useEffect(() => {
    const nodes = map.getContainer().querySelectorAll<HTMLElement>(".op-pin");
    nodes.forEach((el) =>
      el.classList.toggle("is-active", el.getAttribute("data-place-id") === activeId),
    );
  }, [activeId, map, places]);

  return (
    <>
      {places.map((place) => (
        <Marker
          key={place.id}
          position={[place.lat, place.lng]}
          icon={icons.get(place.id)}
          eventHandlers={{ click: () => onSelect(place.id) }}
        />
      ))}
    </>
  );
}
