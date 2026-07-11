/**
 * Dashboard-facing glue between a stored `Creation` and the static experience
 * registry (`lib/experiences`). A creation's `type` is the same slug the
 * registry keys on (e.g. "scrapbook"), so we can borrow the experience's name,
 * icon, and preview gradient to render a creation card — and resolve where the
 * builder lives so a card can be opened back up for editing.
 */
import { experienceHref, getExperience } from "@/lib/experiences";
import type { Creation } from "@/types/creation";

// The experience types that have an in-app builder. A builder always lives at
// `/<type>/build`, so this one list is the single source of truth for both the
// "new" and "open existing" links (and the `?id=` edit URL) — no parallel maps
// to keep in sync.
const BUILDABLE_TYPES = [
  "scrapbook",
  "our-places",
  "memory-jar",
  "memory-pages",
  "constellation",
  "memory-city",
  "memory-lantern",
  "chocolate-bouquet",
  "ludo",
  "countdown",
  "proposal",
  "date-ask",
  "desire-deck",
  "desire-matcher",
  "dice-of-desire",
  "love-coupons",
  "naughty-spins",
  "snakes-and-lovers",
  "spotify-plaque",
  "string-frame",
  "timeless-treasure",
  "time-capsule",
] as const;

/** True when a fresh creation of this type can be authored in-app today. */
export function hasBuilder(slug: string) {
  return (BUILDABLE_TYPES as readonly string[]).includes(slug);
}

/** Where a creation card's "Open" action goes (the builder, scoped to its id). */
export function creationOpenHref(creation: Pick<Creation, "type" | "id">) {
  return hasBuilder(creation.type)
    ? `/${creation.type}/build?id=${creation.id}`
    : experienceHref(creation.type);
}

/**
 * The in-dashboard detail hub for a creation — the options view (Edit, Share,
 * Rename, Publish…). Rendered inside the dashboard shell via `?id=`, so opening a
 * card never leaves the logged-in workspace. Falls back to the experience preview
 * for types with no in-app builder (nothing to manage in-app yet).
 */
export function creationDetailHref(creation: Pick<Creation, "type" | "id">) {
  return hasBuilder(creation.type)
    ? `/dashboard?id=${creation.id}`
    : experienceHref(creation.type);
}

/** The embedded builder for a creation — the detail hub's "Edit" target. */
export function creationEditHref(creation: Pick<Creation, "type" | "id">) {
  return `/dashboard?id=${creation.id}&edit=1`;
}

/**
 * Where the "Start a new <type>" tile points. For a buildable type this opens the
 * builder embedded in the dashboard shell (`?new=`), keeping authoring inside the
 * logged-in app; otherwise it sends the user to the experience preview so the tile
 * is never a dead end. (These tiles only render for signed-in users; the public
 * "Make your own" CTAs still point at `/<type>/build`, which redirects here once
 * signed in — see `useCreationSync`.)
 */
export function newCreationHref(slug: string) {
  return hasBuilder(slug) ? `/dashboard?new=${slug}` : experienceHref(slug);
}

/** Display metadata for a creation, falling back gracefully on unknown types. */
export function creationMeta(type: string) {
  const exp = getExperience(type);
  return {
    name: exp?.name ?? type,
    icon: exp?.icon ?? "Sparkles",
    previewGradient:
      exp?.previewGradient ??
      "radial-gradient(ellipse 70% 60% at 50% 30%, #fff7f1 0%, #fbeede 60%, #f4e0cb 100%)",
  };
}

/** Compact "2 days ago" style stamp. Pure, locale-light, good enough for cards. */
export function formatRelativeTime(iso: string, now: number = Date.now()) {
  const then = new Date(iso).getTime();
  const seconds = Math.round((now - then) / 1000);
  if (Number.isNaN(seconds)) return "";
  if (seconds < 45) return "just now";

  const units: [limit: number, secs: number, label: string][] = [
    [60, 1, "second"],
    [3600, 60, "minute"],
    [86400, 3600, "hour"],
    [604800, 86400, "day"],
    [2629800, 604800, "week"],
    [31557600, 2629800, "month"],
    [Infinity, 31557600, "year"],
  ];
  for (const [limit, secs, label] of units) {
    if (seconds < limit) {
      const value = Math.max(1, Math.round(seconds / secs));
      return `${value} ${label}${value === 1 ? "" : "s"} ago`;
    }
  }
  return "";
}
