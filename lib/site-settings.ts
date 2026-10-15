/**
 * Website mode + feature visibility from Django SiteSettings.
 * Defaults match V1 (everything on) so a missing API never blanks the site.
 */

export type SiteMode = "v1" | "v2";

export type SiteSettings = {
  site_mode: SiteMode;
  show_memory_bank: boolean;
  show_memory_bank_spotlight: boolean;
  show_red_zone: boolean;
  show_kynd: boolean;
  show_gifts: boolean;
  show_games: boolean;
  show_recommend: boolean;
  show_experiences: boolean;
  show_pricing: boolean;
  show_play_and_night: boolean;
  show_cart: boolean;
  updated_at: string;
};

/** Safe fallback when Django is unreachable — current production behaviour. */
export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  site_mode: "v1",
  show_memory_bank: true,
  show_memory_bank_spotlight: true,
  show_red_zone: true,
  show_kynd: true,
  show_gifts: true,
  show_games: true,
  show_recommend: true,
  show_experiences: true,
  show_pricing: true,
  show_play_and_night: true,
  show_cart: true,
  updated_at: "",
};

export type SiteFeatureKey = Exclude<
  keyof SiteSettings,
  "site_mode" | "updated_at"
>;

export function isFeatureEnabled(
  settings: SiteSettings,
  key: SiteFeatureKey,
): boolean {
  return Boolean(settings[key]);
}
