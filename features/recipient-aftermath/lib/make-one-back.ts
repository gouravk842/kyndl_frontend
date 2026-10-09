import { hasBuilder, newCreationHref } from "@/lib/creations";

/**
 * Soft reciprocal CTA destination. Dashboard `?new=` for buildable types so
 * signed-in recipients land in the authoring shell.
 *
 * When the viewer has a referral code, we also expose a shareable product link
 * (`referralExperienceHref`) so they can refer that experience onward — the
 * create CTA itself stays on `newCreationHref` so self-referral isn't stamped
 * when they publish their own keepsake.
 */
export function makeOneBackHref(
  experienceType: string,
  fromToken: string,
): string | null {
  if (!hasBuilder(experienceType)) return null;
  const base = newCreationHref(experienceType);
  const sep = base.includes("?") ? "&" : "?";
  return `${base}${sep}from=${encodeURIComponent(fromToken)}&ref=make-one-back`;
}

/** Public referral short-link for an experience product. */
export function referralExperienceHref(
  code: string,
  experienceType: string,
): string {
  return `/r/${encodeURIComponent(code)}/exp/${encodeURIComponent(experienceType)}`;
}

/** Soft reciprocal CTA label — keep it short; the line above carries the ask. */
export function makeOneBackLabel(_experienceType: string): string {
  return "Make one back";
}
