"use client";

import { motion } from "framer-motion";
import { ArrowRight, Heart, Sparkles } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";

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
      <div className="aspect-square w-full animate-pulse rounded-[2rem] bg-[#FCEEE3]" />
    ),
  },
);

const ease = [0.22, 1, 0.36, 1] as const;

export function HeroSection() {
  return (
    <section className="relative min-h-[calc(100vh-4rem)] overflow-hidden">
      <AmbientBackground />
      <PageContainer
        size="xl"
        className="relative flex min-h-[calc(100vh-4rem)] flex-col justify-start pt-6 pb-16 lg:pt-8 lg:pb-20"
      >
        <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease, delay: 0.1 }}
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-[#F2DACE] bg-white/70 px-4 py-1.5 text-xs font-medium tracking-wide text-[#C75B39] backdrop-blur-sm">
              <Sparkles className="size-3.5" />
              Keep once. Gift a hundred ways.
            </span>

            <h1 className="mt-6 font-display text-[2.35rem] leading-[1.04] tracking-tight text-[#3A2A25] min-[380px]:text-[2.6rem] sm:text-5xl lg:text-6xl xl:text-[4.4rem]">
              Some moments
              <br />
              deserve more than a{" "}
              <span className="relative font-cursive text-[#C75B39]">
                text.
                <svg
                  className="absolute -bottom-3 left-0 w-full"
                  viewBox="0 0 200 12"
                  fill="none"
                  preserveAspectRatio="none"
                  aria-hidden
                >
                  <motion.path
                    d="M2 8C40 3 80 3 120 6c30 2 60 1 78-3"
                    stroke="#FF7A59"
                    strokeWidth="3"
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1.1, ease, delay: 0.7 }}
                  />
                </svg>
              </span>
            </h1>

            <p className="mt-8 max-w-lg text-lg leading-relaxed text-[#7A6258]">
              Start with a{" "}
              <Link
                href={ROUTES.memoryBankStory}
                className="text-[#3A2A25] underline-offset-4 hover:underline"
              >
                Memory Bank
              </Link>{" "}
              — photos, notes, little days in one place. Then grow them into a
              scrapbook they can hold, a night sky of your moments, a jar of
              notes. Or craft any keepsake on its own.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-4">
              <KyndlButton size="lg" href={ROUTES.memories} className="group">
                Open the Memory Bank
                <ArrowRight className="ml-2 size-4 transition-transform duration-300 group-hover:translate-x-1" />
              </KyndlButton>
              <KyndlButton
                size="lg"
                variant="secondary"
                href={ROUTES.recommend}
              >
                Find the right gift
              </KyndlButton>
            </div>

            <div className="mt-10 flex items-center gap-4">
              <div className="flex -space-x-2.5">
                {["#FF7A59", "#F2596F", "#F0A13D", "#FF9A7B"].map((c, i) => (
                  <span
                    key={c}
                    className="flex size-9 items-center justify-center rounded-full border-2 border-[#FFF7F1] text-white shadow-sm"
                    style={{ background: c, zIndex: 4 - i }}
                  >
                    <Heart className="size-3.5 fill-white" aria-hidden />
                  </span>
                ))}
              </div>
              <p className="text-sm leading-snug text-[#7A6258]">
                <span className="font-semibold text-[#3A2A25]">
                  Made for the people you love
                </span>
                <br />
                personalized in minutes — no design skills needed.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, ease, delay: 0.35 }}
          >
            <EmotionalShowcase />
          </motion.div>
        </div>
      </PageContainer>
    </section>
  );
}
