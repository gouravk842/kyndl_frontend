import { PageContainer } from "@/components/layout/page-container";
import { ROUTES } from "@/constants/routes";
import { GiftShop } from "@/features/gifts/components/gift-shop";
import { createMetadata } from "@/lib/seo";
import { getGiftCatalog } from "@/lib/server/gifts";
import { requireSiteFeature } from "@/lib/server/require-site-feature";

export const metadata = createMetadata({
  title: "Gifts",
  description:
    "Little physical treasures worth unwrapping — curated, playful gifts that arrive with intention. Add to your bag and send some warmth.",
  path: ROUTES.gifts,
});

// Stock and pricing are backend-controlled; fetch fresh per request.
export const dynamic = "force-dynamic";

export default async function GiftsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string }>;
}) {
  await requireSiteFeature("show_gifts");
  const [params, products] = await Promise.all([
    searchParams,
    getGiftCatalog(),
  ]);
  const initialCategory =
    typeof params.category === "string" && params.category.trim()
      ? params.category.trim()
      : null;
  const initialQuery =
    typeof params.q === "string" && params.q.trim() ? params.q.trim() : "";

  return (
    <section className="relative py-3 md:py-4">
      <PageContainer size="xl" className="relative">
        <GiftShop
          products={products}
          initialCategory={initialCategory}
          initialQuery={initialQuery}
        />
      </PageContainer>
    </section>
  );
}
