import type { MetadataRoute } from "next";

import { clientEnv } from "@/config/env";
import { experienceHref, getLiveExperienceSlugs } from "@/lib/experiences";

export default function sitemap(): MetadataRoute.Sitemap {
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
    "/about",
    "/blog",
    "/terms",
    "/privacy",
    "/refund",
  ];

  const productPages = getLiveExperienceSlugs().map(experienceHref);

  const routes = Array.from(new Set([...marketing, ...productPages]));

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified,
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1 : 0.8,
  }));
}
