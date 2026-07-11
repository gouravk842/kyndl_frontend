import { Gift, Sparkles, Truck } from "lucide-react";

import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/shared/page-header";
import { ROUTES } from "@/constants/routes";
import { GiftShop } from "@/features/gifts/components/gift-shop";
import { GiftsSectionNav } from "@/features/gifts/components/gifts-section-nav";
import { createMetadata } from "@/lib/seo";
import { getGiftCatalog } from "@/lib/server/gifts";

export const metadata = createMetadata({
  title: "Gifts",
  description:
    "Little physical treasures worth unwrapping — curated, playful gifts that arrive with intention. Add to your bag and send some warmth.",
  path: ROUTES.gifts,
});

// Stock and pricing are backend-controlled; fetch fresh per request.
export const dynamic = "force-dynamic";

const PERKS = [
  { icon: Sparkles, label: "Hand-picked, small-batch" },
  { icon: Truck, label: "Free shipping over ₹999" },
  { icon: Gift, label: "Wrapped with a note" },
];

export default async function GiftsPage() {
  const products = await getGiftCatalog();

  return (
    <div className="relative overflow-hidden">
      <PageHeader
        eyebrow="The gift shop"
        title={
          <>
            Little things that say{" "}
            <span className="kyndl-text-warm">the big thing.</span>
          </>
        }
        subtitle="Real, physical treasures — chosen with care, wrapped with a note, and sent to their doorstep. Pick a few, fill your bag, make someone's day."
      >
        <div className="flex flex-col gap-6">
          <GiftsSectionNav />
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-[#7A6258]">
            {PERKS.map((perk) => (
              <span key={perk.label} className="inline-flex items-center gap-2">
                <perk.icon className="size-4 text-[#FF7A59]" />
                {perk.label}
              </span>
            ))}
          </div>
        </div>
      </PageHeader>

      {/* ── Catalog ───────────────────────────────────────────────── */}
      <section className="relative py-10 md:py-14">
        <PageContainer size="xl" className="relative">
          <GiftShop products={products} />
        </PageContainer>
      </section>
    </div>
  );
}
