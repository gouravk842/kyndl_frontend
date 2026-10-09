import "server-only";

export type LegalPageSlug = "terms" | "privacy" | "refund";

export type LegalPage = {
  slug: LegalPageSlug;
  title: string;
  body: string;
  updated_at: string;
};

const DJANGO_BASE = (
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1"
).replace(/\/$/, "");

const LEGAL_SLUGS = new Set<string>(["terms", "privacy", "refund"]);

export function isLegalPageSlug(value: string): value is LegalPageSlug {
  return LEGAL_SLUGS.has(value);
}

/**
 * Fetch a published legal page for SSR. Returns null if missing or unreachable
 * so the route can render a not-found / empty state without crashing.
 */
export async function getLegalPage(
  slug: LegalPageSlug,
): Promise<LegalPage | null> {
  try {
    const res = await fetch(`${DJANGO_BASE}/legal/${slug}/`, {
      method: "GET",
      headers: { Accept: "application/json" },
      next: { revalidate: 300 },
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
