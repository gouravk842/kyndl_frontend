import type { MetadataRoute } from "next";

import { clientEnv } from "@/config/env";
import { experienceHref } from "@/lib/experiences";
import {
  getExperiencesView,
  getRedZoneExperiencesView,
} from "@/lib/server/experiences";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = clientEnv.NEXT_PUBLIC_APP_URL;
  const lastModified = new Date();

  const marketing = [
    "",
    "/memory-bank",
    "/kynd",
    "/experiences",
    "/games",
    "/ideas",
    "/pricing",
    "/terms",
    "/privacy",
    "/refund",
  ];

  const [catalog, redZone] = await Promise.all([
    getExperiencesView(),
    getRedZoneExperiencesView(),
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
