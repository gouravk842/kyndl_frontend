"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { KyndlButton } from "@/components/landing/kyndl-button";
import { PageContainer } from "@/components/layout/page-container";
import { useSiteSettings } from "@/components/site-settings/site-settings-provider";
import { ROUTES } from "@/constants/routes";

const ease = [0.22, 1, 0.36, 1] as const;

/** Full-bleed boutique hero — real product photography as the plane. */
export function ShopHero() {
  const settings = useSiteSettings();

  return (
    <section className="relative min-h-[calc(100svh-4rem)] overflow-hidden">
      <motion.div
        className="absolute inset-0"
        initial={{ scale: 1.06 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1.4, ease }}
      >
        <Image
          src="/images/shop-hero-v2.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-[68%_40%] sm:object-[72%_42%]"
        />
      </motion.div>

      {/* Soft left wash so type stays readable — not a badge overlay */}
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden
        style={{
          background:
            "linear-gradient(90deg, rgba(42,24,20,0.72) 0%, rgba(42,24,20,0.45) 38%, rgba(42,24,20,0.12) 62%, transparent 78%), linear-gradient(180deg, rgba(42,24,20,0.2) 0%, transparent 28%, rgba(42,24,20,0.35) 100%)",
        }}
      />

      <PageContainer
        size="xl"
        className="relative flex min-h-[calc(100svh-4rem)] flex-col justify-end pb-16 pt-28 sm:justify-center sm:pb-20 sm:pt-20"
      >
        <motion.div
          className="max-w-lg"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease, delay: 0.15 }}
        >
          <p className="font-display text-[clamp(3.25rem,10vw,5.75rem)] leading-[0.92] tracking-tight text-[#F7EFE8]">
            Kyndl
          </p>
          <h1 className="mt-5 max-w-md font-display text-[clamp(1.45rem,3.6vw,2rem)] leading-snug text-[#F7EFE8]/95">
            Gifts they’ll feel —
            <span className="font-cursive text-[#E8C4A0]">
              {" "}
              every day after.
            </span>
          </h1>
          <p className="mt-4 max-w-sm text-base leading-relaxed text-[#F7EFE8]/78 sm:text-[1.05rem]">
            Jewellery and keepsakes chosen to feel personal — wrap, ship, or
            surprise them with something lasting.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            {settings.show_gifts ? (
              <KyndlButton
                size="lg"
                href={ROUTES.gifts}
                className="group border-0 bg-[#F7EFE8] text-[#2A1814] shadow-none hover:bg-white hover:shadow-none"
              >
                Shop now
                <ArrowRight className="ml-2 size-4 transition-transform duration-300 group-hover:translate-x-1" />
              </KyndlButton>
            ) : null}
            {settings.show_experiences ? (
              <LinkGhost href={ROUTES.experiences}>Digital keepsakes</LinkGhost>
            ) : null}
          </div>
        </motion.div>
      </PageContainer>
    </section>
  );
}

function LinkGhost({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="inline-flex h-12 items-center px-2 text-base font-medium text-[#F7EFE8]/9 underline-offset-4 transition-colors hover:text-white hover:underline"
    >
      {children}
    </Link>
  );
}
