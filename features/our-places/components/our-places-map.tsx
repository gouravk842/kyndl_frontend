"use client";

import "leaflet/dist/leaflet.css";
import "../our-places.css";

import { MapContainer, TileLayer } from "react-leaflet";

import { MAP_CONFIG, PLACES } from "../config";
import { useOurPlacesStore } from "../store";
import { MapControls } from "./map-controls";
import { MapHeader } from "./map-header";
import { PlaceMarkers } from "./place-markers";
import { PlaceSidebar } from "./place-sidebar";
import { StoryCard } from "./story-card";
import { StoryMode } from "./story-mode";
import { StoryThread } from "./story-thread";

/**
 * The whole experience, assembled. The Leaflet map is the canvas; the header,
 * sidebar, and story card are overlays positioned over it. The map is mounted
 * client-only (via the experience wrapper's dynamic import) because Leaflet
 * touches `window` on construction.
 */
export function OurPlacesMap() {
  const activeId = useOurPlacesStore((s) => s.activeId);
  const closePlace = useOurPlacesStore((s) => s.closePlace);
  const activePlace = PLACES.find((p) => p.id === activeId) ?? null;

  return (
    <div className="relative h-full w-full overflow-hidden">
      <MapContainer
        className="op-map"
        center={[MAP_CONFIG.centerLat, MAP_CONFIG.centerLng]}
        zoom={MAP_CONFIG.defaultZoom}
        minZoom={MAP_CONFIG.tiles.minZoom}
        maxZoom={MAP_CONFIG.tiles.maxZoom}
        zoomControl={false}
        attributionControl
        scrollWheelZoom
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
        <StoryThread />
        <PlaceMarkers />
        <MapControls />
      </MapContainer>

      <MapHeader />
      <PlaceSidebar />
      <StoryCard place={activePlace} onClose={closePlace} />
      <StoryMode />
    </div>
  );
}
