"use client";

import { motion } from "framer-motion";
import { Gift, HeartHandshake, Sparkles } from "lucide-react";
import dynamic from "next/dynamic";

import { AmbientBackground } from "@/components/landing/ambient-background";
import { KyndlButton } from "@/components/landing/kyndl-button";
import { PageContainer } from "@/components/layout/page-container";
import { ROUTES } from "@/constants/routes";

const EmotionalShowcase = dynamic(
  () =>
    import("@/components/landing/emotional-showcase").then(
      (m) => m.EmotionalShowcase,
    ),
  {
    loading: () => (
      <div className="aspect-[4/5] w-full animate-pulse rounded-3xl bg-[#151515]" />
    ),
  },
);

export function HeroSection() {
  return (
    <section className="relative min-h-[calc(100vh-4rem)] overflow-hidden">
      <AmbientBackground />
      <PageContainer
        size="xl"
        className="relative flex min-h-[calc(100vh-4rem)] flex-col justify-center py-20 lg:py-28"
      >
        <div className="grid items-center gap-16 lg:grid-cols-2 lg:gap-12">
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
          >
            <p className="mb-6 text-sm font-medium tracking-[0.2em] text-[#D4A373] uppercase">
              Digital gifting for heartfelt moments
            </p>
            <h1 className="font-display text-4xl leading-[1.08] tracking-tight text-[#F5E9E2] md:text-5xl lg:text-6xl xl:text-7xl kyndl-text-glow">
              Send love that feels
              <br />
              <span className="text-[#C21830]">deeper than a message.</span>
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-[#B3B3B3]">
              Build customized digital gifts for your loved ones: emotional
              cards, surprise games, memory capsules, and hidden messages that
              reveal at the perfect moment.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <KyndlButton size="lg" href={ROUTES.register}>
                Create a Custom Gift
              </KyndlButton>
              <KyndlButton size="lg" variant="secondary" href={ROUTES.games}>
                Browse Couple Games
              </KyndlButton>
              <KyndlButton size="lg" variant="secondary" href="#gift-catalog">
                Explore Gift Types
              </KyndlButton>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              {[
                { icon: HeartHandshake, text: "Made for couples" },
                { icon: Gift, text: "Digital cards + games" },
                { icon: Sparkles, text: "Personalized in minutes" },
              ].map((item) => (
                <span
                  key={item.text}
                  className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-[#101010]/80 px-3 py-1.5 text-xs text-[#F5E9E2]"
                >
                  <item.icon className="size-3.5 text-[#D4A373]" />
                  {item.text}
                </span>
              ))}
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.5 }}
          >
            <EmotionalShowcase />
          </motion.div>
        </div>
      </PageContainer>
    </section>
  );
}
