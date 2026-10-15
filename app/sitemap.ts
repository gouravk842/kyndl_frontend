import type { MetadataRoute } from "next";

import { clientEnv } from "@/config/env";
import { experienceHref } from "@/lib/experiences";
import {
  getExperiencesView,
  getRedZoneExperiencesView,
} from "@/lib/server/experiences";
import { getSiteSettings } from "@/lib/server/site-settings";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = clientEnv.NEXT_PUBLIC_APP_URL;
  const lastModified = new Date();
  const settings = await getSiteSettings();

  const marketing: string[] = [""];
  if (settings.show_memory_bank) marketing.push("/memory-bank");
  if (settings.show_kynd) marketing.push("/kynd");
  if (settings.show_experiences) marketing.push("/experiences");
  if (settings.show_games) marketing.push("/games");
  if (settings.show_gifts) marketing.push("/gifts");
  if (settings.show_recommend) marketing.push("/recommend");
  marketing.push("/ideas");
  if (settings.show_pricing) marketing.push("/pricing");
  marketing.push("/terms", "/privacy", "/refund", "/shipping", "/contact");
  if (settings.show_red_zone) marketing.push("/red-zone");

  const catalogPromise = settings.show_experiences
    ? getExperiencesView()
    : Promise.resolve([]);
  const redZonePromise = settings.show_red_zone
    ? getRedZoneExperiencesView()
    : Promise.resolve([]);

  const [catalog, redZone] = await Promise.all([
    catalogPromise,
    redZonePromise,
  ]);
  const productPages = [...catalog, ...redZone].map((e) =>
    experienceHref(e.slug),
  );

  const routes = Array.from(new Set([...marketing, ...productPages]));

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified,
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1 : 0.8,
  }));
}
