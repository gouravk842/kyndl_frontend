import "server-only";

export type LegalPageSlug =
  | "terms"
  | "privacy"
  | "refund"
  | "shipping"
  | "contact";

export type LegalPage = {
  slug: LegalPageSlug;
  title: string;
  body: string;
  updated_at: string;
};

const DJANGO_BASE = (
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1"
).replace(/\/$/, "");

const LEGAL_SLUGS = new Set<string>([
  "terms",
  "privacy",
  "refund",
  "shipping",
  "contact",
]);

export function isLegalPageSlug(value: string): value is LegalPageSlug {
  return LEGAL_SLUGS.has(value);
}

/**
 * Fetch a published legal page for SSR. Backend serves the single edition
 * marked “show on site” in admin — use no-store so flipping that flag
 * updates legal pages immediately. Returns null if missing or unreachable.
 */
export async function getLegalPage(
  slug: LegalPageSlug,
): Promise<LegalPage | null> {
  try {
    const res = await fetch(`${DJANGO_BASE}/legal/${slug}/`, {
      method: "GET",
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
    if (!res.ok) return null;
    const data = (await res.json()) as Partial<LegalPage>;
    if (
      typeof data.slug !== "string" ||
      !isLegalPageSlug(data.slug) ||
      typeof data.title !== "string" ||
      typeof data.body !== "string"
    ) {
      return null;
    }
    return {
      slug: data.slug,
      title: data.title,
      body: data.body,
      updated_at:
        typeof data.updated_at === "string"
          ? data.updated_at
          : new Date().toISOString(),
    };
  } catch {
    return null;
  }
}
