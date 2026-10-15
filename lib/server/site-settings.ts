import "server-only";

import { cache } from "react";

import {
  DEFAULT_SITE_SETTINGS,
  type SiteMode,
  type SiteSettings,
} from "@/lib/site-settings";

const DJANGO_BASE = (
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1"
).replace(/\/$/, "");

function asBool(value: unknown, fallback: boolean): boolean {
  return typeof value === "boolean" ? value : fallback;
}

function normalize(raw: Record<string, unknown>): SiteSettings {
  const modeRaw = raw.site_mode;
  const site_mode: SiteMode = modeRaw === "v2" ? "v2" : "v1";
  return {
    site_mode,
    show_memory_bank: asBool(
      raw.show_memory_bank,
      DEFAULT_SITE_SETTINGS.show_memory_bank,
    ),
    show_memory_bank_spotlight: asBool(
      raw.show_memory_bank_spotlight,
      DEFAULT_SITE_SETTINGS.show_memory_bank_spotlight,
    ),
    show_red_zone: asBool(
      raw.show_red_zone,
      DEFAULT_SITE_SETTINGS.show_red_zone,
    ),
    show_kynd: asBool(raw.show_kynd, DEFAULT_SITE_SETTINGS.show_kynd),
    show_gifts: asBool(raw.show_gifts, DEFAULT_SITE_SETTINGS.show_gifts),
    show_games: asBool(raw.show_games, DEFAULT_SITE_SETTINGS.show_games),
    show_recommend: asBool(
      raw.show_recommend,
      DEFAULT_SITE_SETTINGS.show_recommend,
    ),
    show_experiences: asBool(
      raw.show_experiences,
      DEFAULT_SITE_SETTINGS.show_experiences,
    ),
    show_pricing: asBool(raw.show_pricing, DEFAULT_SITE_SETTINGS.show_pricing),
    show_play_and_night: asBool(
      raw.show_play_and_night,
      DEFAULT_SITE_SETTINGS.show_play_and_night,
    ),
    show_cart: asBool(raw.show_cart, DEFAULT_SITE_SETTINGS.show_cart),
    updated_at:
      typeof raw.updated_at === "string"
        ? raw.updated_at
        : DEFAULT_SITE_SETTINGS.updated_at,
  };
}

/**
 * Server-only fetch of website mode + feature flags. Cached per request.
 * Falls back to V1 defaults if the API is missing or unreachable.
 */
export const getSiteSettings = cache(async (): Promise<SiteSettings> => {
  try {
    const res = await fetch(`${DJANGO_BASE}/content/site-settings/`, {
      method: "GET",
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
    if (!res.ok) return DEFAULT_SITE_SETTINGS;
    const data = (await res.json()) as Record<string, unknown>;
    return normalize(data);
  } catch {
    return DEFAULT_SITE_SETTINGS;
  }
});
