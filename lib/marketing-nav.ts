import { ROUTES } from "@/constants/routes";
import type { SiteSettings } from "@/lib/site-settings";

export type MarketingNavLink = {
  href: string;
  label: string;
  feature: keyof Pick<
    SiteSettings,
    | "show_memory_bank"
    | "show_kynd"
    | "show_gifts"
    | "show_recommend"
    | "show_games"
    | "show_pricing"
  >;
};

/** Full primary-link catalog — filter with `visiblePrimaryLinks`. */
export const MARKETING_PRIMARY_LINKS: MarketingNavLink[] = [
  {
    href: ROUTES.memoryBankStory,
    label: "Memory Bank",
    feature: "show_memory_bank",
  },
  { href: ROUTES.kyndStory, label: "Kynd", feature: "show_kynd" },
  { href: ROUTES.gifts, label: "Gifts", feature: "show_gifts" },
  { href: ROUTES.recommend, label: "For you", feature: "show_recommend" },
  { href: ROUTES.games, label: "Games", feature: "show_games" },
  { href: ROUTES.pricing, label: "Pricing", feature: "show_pricing" },
];

/**
 * V2 (ecommerce) puts Gifts first; V1 keeps Memory Bank first.
 * Only links whose feature flag is on are returned.
 */
export function visiblePrimaryLinks(
  settings: SiteSettings,
): MarketingNavLink[] {
  const links = MARKETING_PRIMARY_LINKS.filter((l) => settings[l.feature]);
  if (settings.site_mode !== "v2") return links;

  const gifts = links.filter((l) => l.feature === "show_gifts");
  const rest = links.filter((l) => l.feature !== "show_gifts");
  return [...gifts, ...rest];
}
