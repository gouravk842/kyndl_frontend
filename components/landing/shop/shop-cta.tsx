"use client";

import { ArrowRight } from "lucide-react";
import Image from "next/image";

import { FadeIn } from "@/components/animations/fade-in";
import { KyndlButton } from "@/components/landing/kyndl-button";
import { PageContainer } from "@/components/layout/page-container";
import { ROUTES } from "@/constants/routes";

export function ShopCta() {
  return (
    <section className="relative overflow-hidden py-20 md:py-28">
      <Image
        src="/images/shop-cat-jewellery.jpg"
        alt=""
        fill
        sizes="100vw"
        className="object-cover object-center"
      />
      <div className="absolute inset-0 bg-[#2A1814]/68" aria-hidden />
      <PageContainer size="xl" className="relative">
        <FadeIn>
          <div className="mx-auto max-w-xl text-center">
            <h2 className="font-display text-3xl tracking-tight text-[#F7EFE8] md:text-4xl">
              Ready to find their gift?
            </h2>
            <p className="mt-4 text-[#F7EFE8]/75">
              Start with jewellery, a keepsake, or something just because.
            </p>
            <KyndlButton
              href={ROUTES.gifts}
              size="lg"
              className="group mt-8 border-0 bg-[#F7EFE8] text-[#2A1814] hover:bg-white"
            >
              Enter the shop
              <ArrowRight className="ml-2 size-4 transition-transform duration-300 group-hover:translate-x-1" />
            </KyndlButton>
          </div>
        </FadeIn>
      </PageContainer>
    </section>
  );
}
