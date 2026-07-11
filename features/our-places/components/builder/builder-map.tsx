"use client";

import "leaflet/dist/leaflet.css";
import "../../our-places.css";

import L from "leaflet";
import { useEffect, useMemo, useRef } from "react";
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from "react-leaflet";

import { MOOD_COLORS, TILE_STYLES } from "../../config";
import { useBuilderStore } from "../../store/builder.store";
import type { PlaceDoc } from "../../types";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function pinHtml(place: PlaceDoc): string {
  return `
    <div class="op-pin op-pin--${place.mood}" data-place-id="${escapeHtml(place.id)}" style="--op-pin-color:${MOOD_COLORS[place.mood]};--op-pin-delay:0ms">
      <span class="op-pin__pulse"></span>
      <span class="op-pin__dot"></span>
      <span class="op-pin__label">${escapeHtml(place.name || "Untitled")}</span>
    </div>`;
}

/**
 * The editable map half of the builder. Pins are draggable; clicking the map
 * repositions the selected pin, clicking a pin selects it for editing. Reads and
 * writes the same builder store the panel does, so the two stay in lockstep.
 */
export function BuilderMap() {
  const places = useBuilderStore((s) => s.doc.places);
  const tileStyle = useBuilderStore((s) => s.doc.map.tileStyle ?? "positron");

  // Capture the initial centre/zoom once so edits don't yank the camera around.
  const initial = useRef(useBuilderStore.getState().doc.map);
  const tiles = TILE_STYLES[tileStyle] ?? TILE_STYLES.positron;

  return (
    <div className="op-map relative h-full w-full">
      <MapContainer
        className="op-map"
        center={[initial.current.centerLat, initial.current.centerLng]}
        zoom={initial.current.defaultZoom}
        minZoom={tiles.minZoom}
        maxZoom={tiles.maxZoom}
        zoomControl
        scrollWheelZoom
      >
        <TileLayer
          key={tileStyle}
          url={tiles.url}
          attribution={tiles.attribution}
          {...(tiles.subdomains ? { subdomains: tiles.subdomains } : {})}
          minZoom={tiles.minZoom}
          maxZoom={tiles.maxZoom}
        />
        <BuilderPins places={places} />
        <ClickToPlace />
      </MapContainer>
    </div>
  );
}

function BuilderPins({ places }: { places: PlaceDoc[] }) {
  const map = useMap();
  const selectedId = useBuilderStore((s) => s.selectedId);
  const selectPlace = useBuilderStore((s) => s.selectPlace);
  const setPlaceLocation = useBuilderStore((s) => s.setPlaceLocation);

  // Recreate icons when a place's name/mood changes so the label/colour follow.
  const icons = useMemo(
    () =>
      new Map(
        places.map((p) => [
          p.id,
          L.divIcon({
            html: pinHtml(p),
            className: "",
            iconSize: [0, 0],
            iconAnchor: [0, 0],
          }),
        ]),
      ),
    [places],
  );

  // Highlight the selected pin without recreating it.
  useEffect(() => {
    const nodes = map.getContainer().querySelectorAll<HTMLElement>(".op-pin");
    nodes.forEach((el) =>
      el.classList.toggle(
        "is-active",
        el.getAttribute("data-place-id") === selectedId,
      ),
    );
  }, [map, selectedId, places]);

  return (
    <>
      {places.map((p) => (
        <Marker
          key={p.id}
          position={[p.lat, p.lng]}
          icon={icons.get(p.id)}
          draggable
          eventHandlers={{
            click: () => selectPlace(p.id),
            dragend: (e) => {
              const { lat, lng } = e.target.getLatLng();
              setPlaceLocation(p.id, lat, lng);
            },
          }}
        />
      ))}
    </>
  );
}

/** Clicking empty map moves the selected pin there (the quick way to place it). */
function ClickToPlace() {
  const selectedId = useBuilderStore((s) => s.selectedId);
  const setPlaceLocation = useBuilderStore((s) => s.setPlaceLocation);
  useMapEvents({
    click: (e) => {
      if (selectedId) setPlaceLocation(selectedId, e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}
