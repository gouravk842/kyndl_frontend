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
    <section className="bg-white py-16 md:py-24">
      <PageContainer size="xl">
        <FadeIn>
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl tracking-tight text-[#2A1814] md:text-[2.35rem]">
              New &amp; most loved
            </h2>
            <p className="mt-3 text-[#7A6258]">
              Pieces people send when words aren’t quite enough.
            </p>
          </div>
        </FadeIn>

        {featured.length === 0 ? (
          <FadeIn delay={0.08}>
            <div className="mx-auto mt-14 max-w-md text-center">
              <p className="text-[#7A6258]">
                Fresh arrivals are on the way. Explore the shop while we dress
                the shelves.
              </p>
              <KyndlButton href={ROUTES.gifts} className="mt-7" size="lg">
                Browse the shop
              </KyndlButton>
            </div>
          </FadeIn>
        ) : (
          <>
            <ul className="mt-12 grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-5 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-6 lg:gap-y-10">
              {featured.map((product, index) => (
                <li key={product.slug}>
                  <GiftCard product={product} index={index} />
                </li>
              ))}
            </ul>
            <div className="mt-12 flex justify-center">
              <Link
                href={ROUTES.gifts}
                className="group inline-flex items-center gap-2 text-sm font-semibold tracking-wide text-[#2A1814] underline-offset-4 hover:underline"
              >
                Shop the full collection
                <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5" />
              </Link>
            </div>
          </>
        )}
      </PageContainer>
    </section>
  );
}
