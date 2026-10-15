import "server-only";

import { notFound } from "next/navigation";

import { getSiteSettings } from "@/lib/server/site-settings";
import type { SiteFeatureKey } from "@/lib/site-settings";

/** Soft-404 a marketing page when its feature flag is off. */
export async function requireSiteFeature(key: SiteFeatureKey): Promise<void> {
  const settings = await getSiteSettings();
  if (!settings[key]) notFound();
}
