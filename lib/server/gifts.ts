import "server-only";

import { cache } from "react";

import type { GiftProduct, ProductCategory, PublicStore } from "@/types/gift";

/**
 * Server-only fetch of the public physical-gift catalog from Django. Used by the
 * `/gifts` server pages and the v2 homepage. ISR for 60s so those routes can be
 * CDN-cached; a backend hiccup still renders an empty shop rather than a 500.
 *
 * Wrapped in `React.cache` so `generateMetadata` + the page share one fetch per
 * request.
 */

const DJANGO_BASE = (
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1"
).replace(/\/$/, "");

export const getGiftCatalog = cache(async (): Promise<GiftProduct[]> => {
  try {
    const res = await fetch(`${DJANGO_BASE}/gifts/catalog/`, {
      headers: { Accept: "application/json" },
      next: { revalidate: 60 },
    });
    if (!res.ok) {
      console.error(
        `[gifts] catalog fetch failed: ${res.status} ${res.statusText}`,
      );
      return [];
    }
    return (await res.json()) as GiftProduct[];
  } catch (err) {
    console.error("[gifts] catalog fetch error:", err);
    return [];
  }
});

export const getGiftCategories = cache(async (): Promise<ProductCategory[]> => {
  try {
    const res = await fetch(`${DJANGO_BASE}/gifts/categories/`, {
      headers: { Accept: "application/json" },
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    return (await res.json()) as ProductCategory[];
  } catch {
    return [];
  }
});

export const getGiftProduct = cache(
  async (slug: string): Promise<GiftProduct | null> => {
    try {
      const res = await fetch(`${DJANGO_BASE}/gifts/catalog/${slug}/`, {
        headers: { Accept: "application/json" },
        next: { revalidate: 60 },
      });
      if (!res.ok) return null;
      return (await res.json()) as GiftProduct;
    } catch {
      return null;
    }
  },
);

export const getGiftStore = cache(
  async (slug: string): Promise<PublicStore | null> => {
    try {
      const res = await fetch(`${DJANGO_BASE}/gifts/shops/${slug}/`, {
        headers: { Accept: "application/json" },
        next: { revalidate: 60 },
      });
      if (!res.ok) return null;
      return (await res.json()) as PublicStore;
    } catch {
      return null;
    }
  },
);
