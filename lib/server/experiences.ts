import "server-only";

import { cache } from "react";

import {
  buildExperienceViews,
  type ExperienceView,
  filterCatalogExperiences,
  filterRedZoneExperiences,
} from "@/lib/experience-catalog";
import { getPricing } from "@/lib/server/pricing";

export type { ExperiencePrice, ExperienceView } from "@/lib/experience-catalog";

/**
 * The static experience registry merged with the backend catalog control plane.
 *
 * For each experience, the backend (matched by `slug === code`) governs:
 *   - whether it appears on the site at all (`is_visible`),
 *   - its display `status` ("live" | "soon"),
 *   - its `price`,
 *   - its sort order.
 * Everything else (copy, icons, gradients, highlights, steps) comes from the
 * static registry. When the pricing feed is unreachable, experiences fall back
 * to static defaults so the site never breaks. When the feed is reachable,
 * `is_visible=False` (or a missing Product row) keeps the experience off every
 * website surface.
 */

const buildViews = cache(async (): Promise<ExperienceView[]> => {
  const pricing = await getPricing();
  return buildExperienceViews(pricing.entries, pricing.ok);
});

/** Visible, live experiences in backend display order.
 *  Coming-soon products stay off the catalog. Adults-only (Red Zone)
 *  experiences are excluded — they live in their own 18+ section. */
export async function getExperiencesView(): Promise<ExperienceView[]> {
  return filterCatalogExperiences(await buildViews());
}

/** Visible, live experiences for the landing gallery, in backend display order.
 *  Adults-only experiences are kept off the main bento. */
export async function getFeaturedExperiencesView(): Promise<ExperienceView[]> {
  return filterCatalogExperiences(await buildViews());
}

/** Visible, live adults-only experiences for the dedicated 18+ "Red Zone"
 *  section, in backend display order. */
export async function getRedZoneExperiencesView(): Promise<ExperienceView[]> {
  return filterRedZoneExperiences(await buildViews());
}

/** One visible experience by slug, or undefined when hidden/unknown. Includes
 *  adults-only experiences, so their own product page still resolves. */
export async function getExperienceView(
  slug: string,
): Promise<ExperienceView | undefined> {
  return (await buildViews()).find((v) => v.slug === slug);
}
