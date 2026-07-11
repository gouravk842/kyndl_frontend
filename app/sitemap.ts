import type { MetadataRoute } from "next";

import { clientEnv } from "@/config/env";
import {
  experienceHref,
  experiences,
  getLiveExperienceSlugs,
} from "@/lib/experiences";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = clientEnv.NEXT_PUBLIC_APP_URL;
  const lastModified = new Date();

  const marketing = [
    "",
    "/experiences",
    "/games",
    "/pricing",
    "/about",
    "/blog",
  ];

  // Each experience's product page plus its live experience route.
  const productPages = getLiveExperienceSlugs().map(experienceHref);
  const liveRoutes = experiences
    .map((e) => e.liveHref)
    .filter((href): href is string => Boolean(href));

  const routes = Array.from(
    new Set([...marketing, ...productPages, ...liveRoutes]),
  );

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified,
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1 : 0.8,
  }));
}
