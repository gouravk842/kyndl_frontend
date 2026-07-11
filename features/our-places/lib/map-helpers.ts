import type { Map as LeafletMap } from "leaflet";

import { MOOD_COLORS, type Place } from "../config";

/** Below this width the story card is a bottom sheet; at/above it slides in from the right. */
export const MOBILE_BREAKPOINT = 640;
/** Pixel width of the desktop story-card panel — used to offset the fly target. */
export const CARD_WIDTH = 360;

/**
 * Fly the map so the pin sits clear of the open story card, rather than dead
 * centre where the card would cover it.
 *
 * On desktop the card occupies the right edge, so we want the pin left-of-centre:
 * we recentre on a point *east* of the pin (the pin then renders to the left).
 * On mobile the bottom sheet covers the lower ~70%, so we recentre on a point
 * *south* of the pin (the pin then renders in the visible upper band).
 *
 * `prefers-reduced-motion` swaps the cinematic fly for an instant setView.
 */
export function flyToPlace(
  map: LeafletMap,
  place: Place,
  targetZoom: number,
  reduceMotion: boolean,
): void {
  const size = map.getSize();
  const isMobile = size.x < MOBILE_BREAKPOINT;

  // Work in projected pixel space at the destination zoom, shift the centre, then
  // convert back to lat/lng. Positive x is east, positive y is south.
  const point = map.project([place.lat, place.lng], targetZoom);
  const offsetX = isMobile ? 0 : CARD_WIDTH / 2;
  const offsetY = isMobile ? -size.y * 0.26 : 0;
  const center = map.unproject(point.add([offsetX, offsetY]), targetZoom);

  if (reduceMotion) {
    map.setView(center, targetZoom, { animate: false });
    return;
  }
  map.flyTo(center, targetZoom, { duration: 1.2, easeLinearity: 0.1 });
}

/**
 * Build the DivIcon markup for a pin. Returns an HTML string consumed by
 * `L.divIcon`. The icon is created once and never replaced; the open/dim state
 * (`is-active` / `is-dimmed`) is toggled imperatively on this node when the
 * active place changes, so the one-time entrance animation never replays.
 * `data-place-id` lets the controller find the right node to toggle.
 */
export function pinHtml(place: Place, index: number): string {
  // Staggered entrance: each pin fades in 150ms after the previous, in array
  // (chronological) order — the map draws the story the way it happened.
  const delay = `${index * 150}ms`;
  const label = escapeHtml(place.name);
  const aria = escapeHtml(
    `${place.name}, ${place.city} — click to read memory`,
  );

  return `
    <div class="op-pin op-pin--${place.mood}" role="button" tabindex="0" aria-label="${aria}" data-place-id="${escapeHtml(place.id)}" style="--op-pin-color:${MOOD_COLORS[place.mood]};--op-pin-delay:${delay}">
      <span class="op-pin__pulse"></span>
      <span class="op-pin__dot"></span>
      <span class="op-pin__label">${label}</span>
    </div>
  `;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
