import "server-only";

/**
 * Server-only fetch of the marketing /pricing page content (hero, model
 * cards, FAQ, CTAs). Distinct from `lib/server/pricing.ts`, which is the
 * product money feed.
 *
 * Called only from the `/pricing` route — no layout/prefetch — so the API hits
 * when a user navigates to Pricing.
 */

export type PricingPageStatus = "published" | "coming_soon";

export type PricingPageCardIcon = "sparkles" | "heart" | "gift";

export type PricingPageCard = {
  icon: PricingPageCardIcon;
  title: string;
  body: string;
  points: string[];
  highlighted: boolean;
  badge?: string;
};

export type PricingPageFaq = {
  question: string;
  answer: string;
};

export type PricingPageCta = {
  label: string;
  href: string;
};

export type PricingPage = {
  status: PricingPageStatus;
  message: string;
  eyebrow: string;
  title: string;
  title_accent: string;
  subtitle: string;
  cards: PricingPageCard[];
  faq_title: string;
  faqs: PricingPageFaq[];
  primary_cta: PricingPageCta;
  secondary_cta: PricingPageCta;
  updated_at: string;
};

const DJANGO_BASE = (
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1"
).replace(/\/$/, "");

const ICONS = new Set<string>(["sparkles", "heart", "gift"]);

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function normalizeCta(raw: unknown): PricingPageCta {
  if (!raw || typeof raw !== "object") return { label: "", href: "" };
  const o = raw as Record<string, unknown>;
  return { label: asString(o.label), href: asString(o.href) };
}

function normalizeCards(raw: unknown): PricingPageCard[] {
  if (!Array.isArray(raw)) return [];
  const out: PricingPageCard[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const o = item as Record<string, unknown>;
    const title = asString(o.title);
    const body = asString(o.body);
    if (!title || !body) continue;
    const iconRaw = asString(o.icon, "sparkles");
    const icon = (
      ICONS.has(iconRaw) ? iconRaw : "sparkles"
    ) as PricingPageCardIcon;
    const points = Array.isArray(o.points)
      ? o.points.filter((p): p is string => typeof p === "string")
      : [];
    const card: PricingPageCard = {
      icon,
      title,
      body,
      points,
      highlighted: Boolean(o.highlighted),
    };
    const badge = asString(o.badge);
    if (badge) card.badge = badge;
    out.push(card);
  }
  return out;
}

function normalizeFaqs(raw: unknown): PricingPageFaq[] {
  if (!Array.isArray(raw)) return [];
  const out: PricingPageFaq[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const o = item as Record<string, unknown>;
    const question = asString(o.question);
    const answer = asString(o.answer);
    if (question && answer) out.push({ question, answer });
  }
  return out;
}

/**
 * Fetch marketing pricing page content for SSR. Returns null if missing or
 * unreachable so the route can show a coming-soon empty state.
 */
export async function getPricingPage(): Promise<PricingPage | null> {
  try {
    const res = await fetch(`${DJANGO_BASE}/content/pricing-page/`, {
      method: "GET",
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
    if (!res.ok) return null;
    const data = (await res.json()) as Record<string, unknown>;
    const statusRaw = asString(data.status);
    if (statusRaw !== "published" && statusRaw !== "coming_soon") return null;
    const title = asString(data.title);
    if (!title && statusRaw === "published") return null;

    return {
      status: statusRaw,
      message: asString(data.message, "Pricing details coming soon."),
      eyebrow: asString(data.eyebrow, "Pricing"),
      title,
      title_accent: asString(data.title_accent),
      subtitle: asString(data.subtitle),
      cards: normalizeCards(data.cards),
      faq_title: asString(data.faq_title, "Questions, answered"),
      faqs: normalizeFaqs(data.faqs),
      primary_cta: normalizeCta(data.primary_cta),
      secondary_cta: normalizeCta(data.secondary_cta),
      updated_at: asString(data.updated_at, new Date().toISOString()),
    };
  } catch {
    return null;
  }
}
