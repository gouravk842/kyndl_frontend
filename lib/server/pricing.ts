import "server-only";

import { cache } from "react";

import type { PricingEntry } from "@/lib/experience-catalog";
import { indexPricing } from "@/lib/experience-catalog";

/**
 * Server-only fetch of the backend public **pricing feed** — the single
 * admin-controlled source for each product's display flags, money, and any
 * launch offer. The website overlays this onto its static presentation registry
 * (`lib/experiences.ts`) by matching the backend `code` to the experience `slug`.
 *
 * Split source of truth: the frontend owns presentation (copy, icons, gradients,
 * the experience itself); the backend owns only what an admin flips without a
 * deploy — visibility, status, sort order, price, and the offer/anchor fields.
 * ISR for 60s so the homepage can be CDN-cached; admin price/visibility edits
 * may take up to a minute. `React.cache` still dedupes within one RSC render.
 *
 * The feed includes hidden products (`is_visible: false`) so callers can
 * withhold them. On failure, `ok` is false and callers may fall back to the
 * static registry.
 */

export type { PricingEntry, ProductStatus } from "@/lib/experience-catalog";

export type PricingFeed = {
  /** True when Django returned a 2xx pricing payload. */
  ok: boolean;
  entries: Record<string, PricingEntry>;
};

const DJANGO_BASE = (
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1"
).replace(/\/$/, "");

/** Pricing keyed by product `code`. `ok: false` when the backend is unreachable. */
export const getPricing = cache(async (): Promise<PricingFeed> => {
  try {
    const res = await fetch(`${DJANGO_BASE}/payments/pricing/`, {
      headers: { Accept: "application/json" },
      next: { revalidate: 60 },
    });
    if (!res.ok) return { ok: false, entries: {} };
    const rows = (await res.json()) as PricingEntry[];
    return { ok: true, entries: indexPricing(rows) };
  } catch {
    return { ok: false, entries: {} };
  }
});
