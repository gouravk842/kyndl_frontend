import "server-only";

import type { GiftProduct, PublicStore } from "@/types/gift";

/**
 * Server-only fetch of the public physical-gift catalog from Django. Used by the
 * `/gifts` server pages (fetched fresh per render). Any failure resolves to an
 * empty list / null so a backend hiccup renders an empty shop rather than a 500.
 */

const DJANGO_BASE = (
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1"
).replace(/\/$/, "");

export async function getGiftCatalog(): Promise<GiftProduct[]> {
  try {
    const res = await fetch(`${DJANGO_BASE}/gifts/catalog/`, {
      headers: { Accept: "application/json" },
      cache: "no-store",
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
}

export async function getGiftProduct(
  slug: string,
): Promise<GiftProduct | null> {
  try {
    const res = await fetch(`${DJANGO_BASE}/gifts/catalog/${slug}/`, {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
    if (!res.ok) return null;
    return (await res.json()) as GiftProduct;
  } catch {
    return null;
  }
}

export async function getGiftStore(slug: string): Promise<PublicStore | null> {
  try {
    const res = await fetch(`${DJANGO_BASE}/gifts/shops/${slug}/`, {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
    if (!res.ok) return null;
    return (await res.json()) as PublicStore;
  } catch {
    return null;
  }
}
