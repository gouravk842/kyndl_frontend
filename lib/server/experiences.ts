import "server-only";

import {
  type Experience,
  experiences,
  type ExperienceStatus,
} from "@/lib/experiences";
import { getPricing, type PricingEntry } from "@/lib/server/pricing";

/**
 * The static experience registry merged with the backend catalog control plane.
 *
 * For each experience, the backend (matched by `slug === code`) governs:
 *   - whether it appears on the site at all (`visible`),
 *   - its display `status` ("live" | "soon"),
 *   - its `price`,
 *   - its sort order.
 * Everything else (copy, icons, gradients, highlights, steps) comes from the
 * static registry. When the backend has no row for a slug — because it is
 * unreachable, or the product has not been registered yet — that experience
 * falls back to its static defaults and stays visible, so the site never breaks.
 */

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

function merge(
  exp: Experience,
  entry: PricingEntry | undefined,
  index: number,
): Ordered | null {
  if (!entry) {
    // No backend row → fall back to the static registry (always visible).
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

async function buildViews(): Promise<ExperienceView[]> {
  const pricing = await getPricing();
  return experiences
    .map((exp, index) => merge(exp, pricing[exp.slug], index))
    .filter((v): v is Ordered => v !== null)
    .sort((a, b) => a.__order - b.__order)
    .map(({ __order: _drop, ...view }) => view);
}

/** Visible, live experiences in backend display order.
 *  Coming-soon products stay off the catalog. Adults-only (Red Zone)
 *  experiences are excluded — they live in their own 18+ section. */
export async function getExperiencesView(): Promise<ExperienceView[]> {
  return (await buildViews()).filter((v) => v.status === "live" && !v.adult);
}

/** Visible, live experiences for the landing gallery, in backend display order.
 *  Adults-only experiences are kept off the main bento. */
export async function getFeaturedExperiencesView(): Promise<ExperienceView[]> {
  return (await buildViews()).filter((v) => v.status === "live" && !v.adult);
}

/** Visible, live adults-only experiences for the dedicated 18+ "Red Zone"
 *  section, in backend display order. */
export async function getRedZoneExperiencesView(): Promise<ExperienceView[]> {
  return (await buildViews()).filter((v) => v.status === "live" && v.adult);
}

/** One visible experience by slug, or undefined when hidden/unknown. Includes
 *  adults-only experiences, so their own product page still resolves. */
export async function getExperienceView(
  slug: string,
): Promise<ExperienceView | undefined> {
  return (await buildViews()).find((v) => v.slug === slug);
}
