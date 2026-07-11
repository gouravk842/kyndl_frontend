/**
 * Time-of-day + anniversary ambience.
 *
 * A real lantern you turn on at night; ours is aware of the hour it's opened. When
 * `timeOfDayAware`, the room's brightness follows the *viewer's* local clock —
 * bright around midday, sinking to a warm, dim ember through the small hours — so
 * a lantern opened at 1am glows like a lantern should. On the `anniversary` date it
 * *flares*: a little brighter, a little more bloom, marking the day.
 *
 * Computed once on mount (not per frame): `new Date()` is fine in the browser.
 */

import type { LanternAmbience } from "../config";

export type AmbienceState = {
  /** Multiplier on the room lights (~0.6 deep night → 1.0 midday). */
  intensity: number;
  /** Today is the anniversary — brighten and bloom a touch more. */
  flare: boolean;
};

function isAnniversaryToday(iso?: string): boolean {
  if (!iso) return false;
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  if (!m) return false;
  const now = new Date();
  return now.getMonth() + 1 === Number(m[2]) && now.getDate() === Number(m[3]);
}

export function computeAmbience(a?: LanternAmbience): AmbienceState {
  const flare = isAnniversaryToday(a?.anniversary);
  if (!a?.timeOfDayAware) return { intensity: 1, flare };

  const now = new Date();
  const h = now.getHours() + now.getMinutes() / 60;
  // Peaks at 13:00, troughs near 01:00. Maps to 0.62 (deep night) → 1.0 (midday).
  const t = Math.cos(((h - 13) / 24) * Math.PI * 2); // 1 … −1
  const intensity = 0.62 + (t * 0.5 + 0.5) * 0.38;
  return { intensity, flare };
}
