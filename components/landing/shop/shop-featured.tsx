"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { FadeIn } from "@/components/animations/fade-in";
import { KyndlButton } from "@/components/landing/kyndl-button";
import { PageContainer } from "@/components/layout/page-container";
import { ROUTES } from "@/constants/routes";
import { GiftCard } from "@/features/gifts/components/gift-card";
import type { GiftProduct } from "@/types/gift";

export function ShopFeatured({ products }: { products: GiftProduct[] }) {
  const featured = [
    ...products.filter((p) => p.is_featured),
    ...products.filter((p) => !p.is_featured),
  ].slice(0, 8);

  return (
    <section className="relative py-16 md:py-24">
      <PageContainer size="xl">
        <FadeIn>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm font-medium tracking-[0.2em] text-[#C75B39] uppercase">
                Fresh from the shop
              </p>
              <h2 className="mt-3 font-display text-3xl text-[#3A2A25] md:text-4xl">
                Pieces worth unwrapping.
              </h2>
            </div>
            <Link
              href={ROUTES.gifts}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#C75B39] hover:text-[#9e3f21]"
            >
              View all gifts
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </FadeIn>

        {featured.length === 0 ? (
          <FadeIn delay={0.08}>
            <div className="mt-12 max-w-lg">
              <p className="text-lg text-[#7A6258]">
                The shelves are being dressed. Browse the shop for what&apos;s
                live, or check back soon for jewellery and new arrivals.
              </p>
              <KyndlButton href={ROUTES.gifts} className="mt-6" size="lg">
                Open the shop
              </KyndlButton>
            </div>
          </FadeIn>
        ) : (
          <ul className="mt-10 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-5">
            {featured.map((product, index) => (
              <li key={product.slug}>
                <GiftCard product={product} index={index} />
              </li>
            ))}
          </ul>
        )}
      </PageContainer>
    </section>
  );
}
