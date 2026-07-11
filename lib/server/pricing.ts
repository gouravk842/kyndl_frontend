import "server-only";

/**
 * Server-only fetch of the backend public **pricing feed** — the single
 * admin-controlled source for each product's display flags, money, and any
 * launch offer. The website overlays this onto its static presentation registry
 * (`lib/experiences.ts`) by matching the backend `code` to the experience `slug`.
 *
 * Split source of truth: the frontend owns presentation (copy, icons, gradients,
 * the experience itself); the backend owns only what an admin flips without a
 * deploy — visibility, status, sort order, price, and the offer/anchor fields.
 * Fetched fresh per render (`cache: "no-store"`) so price/offer edits show
 * promptly.
 *
 * Resilience: any failure (backend down, network, non-200) resolves to `{}`, and
 * callers fall back to the static registry so the marketing site always renders.
 */

export type ProductStatus = "live" | "soon";

export interface PricingEntry {
  code: string;
  is_visible: boolean;
  status: ProductStatus;
  display_order: number;
  is_free: boolean;
  /** Price in the smallest currency unit (paise for INR). */
  amount: number;
  currency: string;
  amount_display: string;
  /** Struck-through anchor price in paise, or null when there's no offer. */
  compare_at_amount: number | null;
  compare_at_display: string;
  offer_label: string;
  has_offer: boolean;
  discount_percent: number;
  /** Paise saved vs. the anchor price. */
  savings_amount: number;
}

const DJANGO_BASE = (
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1"
).replace(/\/$/, "");

/** Pricing keyed by product `code`. Empty object when the backend is unreachable. */
export async function getPricing(): Promise<Record<string, PricingEntry>> {
  try {
    const res = await fetch(`${DJANGO_BASE}/payments/pricing/`, {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
    if (!res.ok) return {};
    const rows = (await res.json()) as PricingEntry[];
    return Object.fromEntries(rows.map((row) => [row.code, row]));
  } catch {
    return {};
  }
}
