/**
 * Client-side analytics tracker.
 *
 * `track()` is fire-and-forget: it never throws, never blocks the UI, and never
 * surfaces an error to the caller — a dropped analytics event must never affect
 * the product. It posts to the same-origin Next BFF (`/api/analytics/events`),
 * which forwards to Django (attaching the user's auth cookie when present).
 *
 * This is the single seam for product analytics. To add a vendor later (e.g.
 * PostHog), forward from inside `track()` here — call sites don't change.
 */

const ENDPOINT = "/api/analytics/events";
const ANON_ID_KEY = "kyndl_anon_id";

/** Stable per-browser id for stitching anonymous (logged-out) activity. */
export function getAnonymousId(): string {
  if (typeof window === "undefined") return "";
  try {
    let id = window.localStorage.getItem(ANON_ID_KEY);
    if (!id) {
      id = crypto.randomUUID();
      window.localStorage.setItem(ANON_ID_KEY, id);
    }
    return id;
  } catch {
    // Private mode / storage disabled — fall back to un-stitched events.
    return "";
  }
}

export interface TrackPayload {
  name: string;
  properties?: Record<string, unknown>;
  /** Defaults to the current path. */
  path?: string;
}

/**
 * Record a product event. Safe to call from anywhere on the client; resolves
 * immediately and swallows all failures.
 */
export function track({ name, properties, path }: TrackPayload): void {
  if (typeof window === "undefined") return;

  const body = JSON.stringify({
    name,
    properties: properties ?? {},
    path: path ?? window.location.pathname,
    anonymous_id: getAnonymousId(),
  });

  try {
    // `keepalive` lets the request outlive a navigation (e.g. a click that
    // routes away immediately after tracking).
    void fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
      credentials: "same-origin",
    }).catch(() => {
      /* analytics is best-effort */
    });
  } catch {
    /* never throw from track() */
  }
}

export const analyticsService = { track };
