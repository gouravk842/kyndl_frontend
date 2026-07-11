/**
 * The single source of truth for how experiences are *grouped* across the site.
 *
 * Both the header mega-menu and the /experiences explorer read from here, so the
 * spine of the catalog is defined once and can never drift between surfaces.
 * Grouping is intentionally separate from the experience registry in
 * `lib/experiences.ts` (which owns copy, icons, pricing, status) — this file only
 * answers "which shelf does a slug live on, and in what order."
 */

export type CategoryId = "keepsake" | "moment" | "play";

export interface ExperienceCategory {
  id: CategoryId;
  /** Short label used as a nav column heading and section title. */
  label: string;
  /** One-line promise shown under the section title on /experiences. */
  blurb: string;
  /** Uppercase eyebrow shown above the section title. */
  eyebrow: string;
}

/** Display order top-to-bottom / left-to-right across the site. */
export const EXPERIENCE_CATEGORIES: ExperienceCategory[] = [
  {
    id: "keepsake",
    label: "Keepsakes",
    eyebrow: "Make it once · they revisit it forever",
    blurb:
      "Little crafted worlds you fill with your story — a book to turn, a sky to trace, a jar to reach into.",
  },
  {
    id: "moment",
    label: "Big moments",
    eyebrow: "Paced, one breath at a time",
    blurb:
      "Not something to read at leisure — a moment they live, build to a beat, and answer right back to you.",
  },
  {
    id: "play",
    label: "Play together",
    eyebrow: "For two — on the couch or across the world",
    blurb: "Game night, reimagined for the two of you.",
  },
];

/**
 * Maps every non-adult experience slug to its shelf. Anything unmapped falls
 * back to "keepsake" so a newly added experience is never dropped from nav.
 */
export const SLUG_CATEGORY: Record<string, CategoryId> = {
  // Keepsakes — things they keep and return to
  scrapbook: "keepsake",
  "memory-pages": "keepsake",
  constellation: "keepsake",
  "memory-city": "keepsake",
  "memory-jar": "keepsake",
  "our-places": "keepsake",
  "string-frame": "keepsake",
  "spotify-plaque": "keepsake",
  "timeless-treasure": "keepsake",
  // Big moments — paced, lived once
  proposal: "moment",
  "date-ask": "moment",
  countdown: "moment",
  "time-capsule": "moment",
  // Play together
  ludo: "play",
};

export const DEFAULT_CATEGORY: CategoryId = "keepsake";

export function categoryOf(slug: string): CategoryId {
  return SLUG_CATEGORY[slug] ?? DEFAULT_CATEGORY;
}

/**
 * Groups a list of experience-like items (anything with a `slug`) into the
 * category order above, dropping empty shelves. Generic so it works with both
 * the static registry and the server `ExperienceView[]`.
 */
export function groupByCategory<T extends { slug: string }>(
  items: T[],
): { category: ExperienceCategory; items: T[] }[] {
  return EXPERIENCE_CATEGORIES.map((category) => ({
    category,
    items: items.filter((item) => categoryOf(item.slug) === category.id),
  })).filter((group) => group.items.length > 0);
}
