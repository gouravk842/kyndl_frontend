/**
 * Central resolver for experience card media.
 *
 * Every card surface (home gallery, /experiences, dashboard, Red Zone, product
 * page hero) must go through `getExperienceMedia` / `ExperienceCardMedia` so a
 * slug always paints the same preview image — never a one-off gradient motif
 * or a hardcoded path in a random component.
 *
 * Source of truth for the image path itself remains `Experience.previewImage`
 * in `lib/experiences.ts`. Add or change an image there and every card updates.
 */
import { getExperience } from "@/lib/experiences";

export const FALLBACK_PREVIEW_GRADIENT =
  "radial-gradient(ellipse 70% 60% at 50% 30%, #fff7f1 0%, #fbeede 60%, #f4e0cb 100%)";

export type ExperienceMedia = {
  slug: string;
  name: string;
  icon: string;
  /** Absolute public path, e.g. `/memory_jar.png`. Null when no still is set. */
  previewImage: string | null;
  /** Gradient used behind the image (and as the sole cover when no image). */
  previewGradient: string;
  accent: string;
};

/** Resolve card media for a slug from the experience registry. */
export function getExperienceMedia(slug: string): ExperienceMedia {
  const exp = getExperience(slug);
  return {
    slug,
    name: exp?.name ?? slug,
    icon: exp?.icon ?? "Sparkles",
    previewImage: exp?.previewImage ?? null,
    previewGradient: exp?.previewGradient ?? FALLBACK_PREVIEW_GRADIENT,
    accent: exp?.accent ?? "from-[#FF7A59]/22 to-transparent",
  };
}

/**
 * Prefer an already-loaded experience-shaped object (avoids a second registry
 * lookup on list pages), falling back to a slug lookup when fields are missing.
 */
export function resolveExperienceMedia(input: {
  slug: string;
  name?: string;
  icon?: string;
  previewImage?: string | null;
  previewGradient?: string;
  accent?: string;
}): ExperienceMedia {
  const fromRegistry = getExperienceMedia(input.slug);
  return {
    slug: input.slug,
    name: input.name ?? fromRegistry.name,
    icon: input.icon ?? fromRegistry.icon,
    previewImage:
      input.previewImage !== undefined
        ? input.previewImage
        : fromRegistry.previewImage,
    previewGradient: input.previewGradient ?? fromRegistry.previewGradient,
    accent: input.accent ?? fromRegistry.accent,
  };
}
