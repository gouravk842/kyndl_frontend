/**
 * Merge the static experience registry with the backend catalog control plane.
 *
 * Shared by server (RSC) and client (menus, dashboard) so every surface applies
 * the same visibility rules. Backend `code` matches experience `slug`.
 *
 * When the pricing feed loaded successfully, only rows with `is_visible: true`
 * appear — missing codes and `is_visible: false` are withheld. When the feed
 * failed (backend unreachable), fall back to the static registry so marketing
 * still renders.
 */

import {
  type Experience,
  experiences,
  type ExperienceStatus,
} from "@/lib/experiences";

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

export interface ExperiencePrice {
  isFree: boolean;
  /** Smallest currency unit (paise for INR). */
  amount: number;
  currency: string;
  /** Struck-through anchor price in paise, or null when there's no offer. */
  compareAtAmount: number | null;
  /** Short badge for an active offer, e.g. "Launch offer". Empty when none. */
  offerLabel: string;
  /** True when a paid product has a valid anchor price above `amount`. */
  hasOffer: boolean;
  /** Whole-number percentage off the anchor, e.g. 40. 0 when no offer. */
  discountPercent: number;
  /** Paise saved vs. the anchor price. 0 when no offer. */
  savingsAmount: number;
}

export type ExperienceView = Experience & {
  /** Backend-controlled price, or null when the backend didn't supply one. */
  price: ExperiencePrice | null;
};

type Ordered = ExperienceView & { __order: number };

function mergeOne(
  exp: Experience,
  entry: PricingEntry | undefined,
  index: number,
  feedOk: boolean,
): Ordered | null {
  if (!entry) {
    // Feed reachable but no Product row → treat as not shown on the website.
    if (feedOk) return null;
    // Feed unreachable → static fallback so the site never goes blank.
    return { ...exp, price: null, __order: index };
  }
  if (!entry.is_visible) return null;
  return {
    ...exp,
    status: entry.status as ExperienceStatus,
    price: {
      isFree: entry.is_free,
      amount: entry.amount,
      currency: entry.currency,
      compareAtAmount: entry.compare_at_amount,
      offerLabel: entry.offer_label,
      hasOffer: entry.has_offer,
      discountPercent: entry.discount_percent,
      savingsAmount: entry.savings_amount,
    },
    __order: entry.display_order,
  };
}

/** Apply pricing/visibility to the static registry. */
export function buildExperienceViews(
  pricing: Record<string, PricingEntry>,
  feedOk: boolean,
  source: Experience[] = experiences,
): ExperienceView[] {
  return source
    .map((exp, index) => mergeOne(exp, pricing[exp.slug], index, feedOk))
    .filter((v): v is Ordered => v !== null)
    .sort((a, b) => a.__order - b.__order)
    .map(({ __order: _drop, ...view }) => view);
}

/** Visible + live + non-adult (main catalog / mega menu / dashboard create). */
export function filterCatalogExperiences(
  views: ExperienceView[],
): ExperienceView[] {
  return views.filter((v) => v.status === "live" && !v.adult);
}

/** Visible + live + adult (Red Zone shelf). */
export function filterRedZoneExperiences(
  views: ExperienceView[],
): ExperienceView[] {
  return views.filter((v) => v.status === "live" && v.adult);
}

/** Index pricing rows by product `code`. */
export function indexPricing(
  rows: PricingEntry[],
): Record<string, PricingEntry> {
  return Object.fromEntries(rows.map((row) => [row.code, row]));
}
