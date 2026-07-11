"use client";

import { Heart, Loader2 } from "lucide-react";
import Link from "next/link";

import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/shared/page-header";
import { ROUTES } from "@/constants/routes";
import { GiftCard } from "@/features/gifts/components/gift-card";
import { GiftsSectionNav } from "@/features/gifts/components/gifts-section-nav";
import { useWishlist } from "@/hooks/use-gifts";

export function WishlistView() {
  const { data: items, isLoading } = useWishlist();

  return (
    <>
      <PageHeader
        eyebrow="Saved for later"
        title="Your wishlist"
        subtitle="The little things you're dreaming of."
      >
        <GiftsSectionNav />
      </PageHeader>

      <PageContainer size="xl" className="py-10 md:py-14">
        {isLoading ? (
          <div className="flex justify-center py-20 text-[#C75B39]">
            <Loader2 className="size-6 animate-spin" />
          </div>
        ) : !items || items.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-[#F2DACE] bg-white/60 py-20 text-center">
            <Heart className="mx-auto size-10 text-[#E3A78C]" />
            <p className="mt-4 font-display text-xl text-[#3A2A25]">
              Nothing saved yet
            </p>
            <p className="mt-2 text-sm text-[#7A6258]">
              Tap the heart on any gift to keep it here.
            </p>
            <Link
              href={ROUTES.gifts}
              className="mt-6 inline-flex h-11 items-center rounded-full bg-gradient-to-r from-[#FF7A59] to-[#F2596F] px-6 text-sm font-medium text-white kyndl-glow-warm"
            >
              Browse gifts
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item, i) => (
              <GiftCard key={item.id} product={item.product} index={i} />
            ))}
          </div>
        )}
      </PageContainer>
    </>
  );
}
