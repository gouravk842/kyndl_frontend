"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

import { KyndlButton } from "@/components/landing/kyndl-button";
import { PageContainer } from "@/components/layout/page-container";
import { useSiteSettings } from "@/components/site-settings/site-settings-provider";
import { ROUTES } from "@/constants/routes";

const ease = [0.22, 1, 0.36, 1] as const;

/** Full-bleed boutique hero — brand first, then one shop promise + CTAs. */
export function ShopHero() {
  const settings = useSiteSettings();

  return (
    <section className="relative min-h-[calc(100vh-4rem)] overflow-hidden">
      {/* Edge-to-edge atmosphere — linen + gold light, jewelry-counter mood */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(115deg, #2A1814 0%, #4A2C24 38%, #8B4A38 68%, #C75B39 100%)",
          }}
        />
        <div
          className="absolute inset-0 opacity-90"
          style={{
            background:
              "radial-gradient(ellipse 55% 70% at 78% 45%, rgba(212,163,115,0.55) 0%, transparent 62%), radial-gradient(ellipse 40% 50% at 18% 80%, rgba(255,122,89,0.28) 0%, transparent 55%)",
          }}
        />
        <motion.div
          className="absolute -right-[12%] top-[8%] h-[70vmin] w-[70vmin] rounded-full border border-[#D4A373]/25"
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, ease }}
        />
        <motion.div
          className="absolute -right-[4%] top-[18%] h-[48vmin] w-[48vmin] rounded-full border border-[#F5E9E2]/15"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.3, ease, delay: 0.12 }}
        />
        {/* Soft jewelry silhouette — visual anchor, not a card */}
        <svg
          className="absolute right-[6%] top-1/2 hidden h-[min(58vh,28rem)] w-auto -translate-y-1/2 text-[#F5E9E2]/90 lg:block"
          viewBox="0 0 240 320"
          fill="none"
          aria-hidden
        >
          <motion.path
            d="M120 36c-18 28-42 48-42 78 0 28 18 48 42 48s42-20 42-48c0-30-24-50-42-78Z"
            stroke="currentColor"
            strokeWidth="1.4"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.85 }}
            transition={{ duration: 1.6, ease, delay: 0.35 }}
          />
          <motion.circle
            cx="120"
            cy="162"
            r="10"
            stroke="currentColor"
            strokeWidth="1.4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.9 }}
            transition={{ delay: 0.9, duration: 0.6 }}
          />
          <motion.path
            d="M78 210c14 36 28 62 42 86 14-24 28-50 42-86"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.7 }}
            transition={{ duration: 1.4, ease, delay: 0.7 }}
          />
          <motion.circle
            cx="120"
            cy="296"
            r="7"
            fill="#D4A373"
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.2, duration: 0.5 }}
          />
        </svg>
      </div>

      <PageContainer
        size="xl"
        className="relative flex min-h-[calc(100vh-4rem)] flex-col justify-center py-16 lg:py-20"
      >
        <motion.div
          className="max-w-xl"
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.85, ease, delay: 0.08 }}
        >
          <p className="font-display text-5xl tracking-tight text-[#F5E9E2] sm:text-6xl lg:text-7xl xl:text-[5.5rem]">
            Kyndl
          </p>
          <h1 className="mt-5 font-display text-2xl leading-tight text-[#F5E9E2]/95 sm:text-3xl lg:text-[2.15rem]">
            A shop for gifts they keep —
            <span className="font-cursive text-[#D4A373]"> forever.</span>
          </h1>
          <p className="mt-5 max-w-md text-base leading-relaxed text-[#F5E9E2]/75 sm:text-lg">
            Jewellery, keepsakes, and thoughtful pieces — curated to feel
            personal, ready to wrap, ship, or send.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-3">
            {settings.show_gifts ? (
              <KyndlButton
                size="lg"
                href={ROUTES.gifts}
                className="group bg-[#F5E9E2] text-[#2A1814] hover:bg-white"
              >
                Shop gifts
                <ArrowRight className="ml-2 size-4 transition-transform duration-300 group-hover:translate-x-1" />
              </KyndlButton>
            ) : null}
            {settings.show_experiences ? (
              <KyndlButton
                size="lg"
                variant="secondary"
                href={ROUTES.experiences}
                className="border-[#F5E9E2]/35 bg-transparent text-[#F5E9E2] hover:bg-[#F5E9E2]/10"
              >
                Digital keepsakes
              </KyndlButton>
            ) : null}
          </div>
        </motion.div>
      </PageContainer>
    </section>
  );
}
