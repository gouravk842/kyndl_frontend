"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, BookOpen, Sparkles, Star } from "lucide-react";

import { FadeIn } from "@/components/animations/fade-in";
import { KyndlButton } from "@/components/landing/kyndl-button";
import { PageContainer } from "@/components/layout/page-container";
import { ROUTES } from "@/constants/routes";

const ORBS = [
  {
    label: "Maya",
    caption: "last summer",
    x: "72%",
    y: "22%",
    fill: "#FF7A59",
  },
  {
    label: "Us",
    caption: "rainy Tuesdays",
    x: "18%",
    y: "58%",
    fill: "#F0A13D",
  },
  {
    label: "Home",
    caption: "the apartment",
    x: "78%",
    y: "68%",
    fill: "#F2596F",
  },
] as const;

const BLOOMS = [
  { icon: BookOpen, label: "Scrapbook" },
  { icon: Sparkles, label: "Memory jar" },
  { icon: Star, label: "Night sky" },
] as const;

const PATHS = [
  {
    step: "01",
    title: "Keep the days",
    body: "Photos, a line, a little Tuesday. One bank for each person you love.",
  },
  {
    step: "02",
    title: "Grow a world",
    body: "Kyndl can turn that bank into a scrapbook, a jar, a city of memories.",
  },
  {
    step: "03",
    title: "Or start one",
    body: "Want a single gift tonight? Pick any experience and make it by hand.",
  },
] as const;

export function MemoryBankSpotlight() {
  const reduceMotion = useReducedMotion();

  return (
    <section
      id="memory-bank"
      className="relative overflow-hidden py-24 md:py-32"
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 48% 42% at 82% 18%, rgba(255,160,120,0.32) 0%, transparent 70%), radial-gradient(ellipse 40% 36% at 8% 88%, rgba(242,89,111,0.18) 0%, transparent 72%)",
        }}
        aria-hidden
      />

      <PageContainer size="xl" className="relative">
        <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12">
          <FadeIn>
            <p className="text-sm font-medium tracking-[0.2em] text-[#C75B39] uppercase">
              The Memory Bank
            </p>
            <h2 className="mt-4 font-display text-3xl leading-tight text-[#3A2A25] md:text-4xl lg:text-5xl">
              Keep once.
              <br />
              <span className="kyndl-text-warm">Gift a hundred ways.</span>
            </h2>
            <p className="mt-5 max-w-lg text-lg leading-relaxed text-[#7A6258]">
              This is the heart of Kyndl. Drop the ordinary days and the
              once-in-a-lifetimes into one place. Then grow them into a
              scrapbook they can hold, a jar of notes, a night sky — or craft
              any experience on its own, tonight.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <KyndlButton size="lg" href={ROUTES.memories} className="group">
                Open the Memory Bank
                <ArrowRight className="ml-2 size-4 transition-transform duration-300 group-hover:translate-x-1" />
              </KyndlButton>
              <KyndlButton
                size="lg"
                variant="secondary"
                href={ROUTES.experiences}
              >
                Browse experiences
              </KyndlButton>
            </div>
          </FadeIn>

          <FadeIn delay={0.12}>
            <div className="relative mx-auto mb-8 aspect-square w-full max-w-md lg:mb-2 lg:max-w-none">
              <div
                className="kyndl-card-soft relative size-full overflow-hidden rounded-[2rem] border border-[#F4DDD0] bg-[#FFF7F1]"
                aria-hidden
              >
                <svg className="absolute inset-0 size-full text-[#FF7A59]/25">
                  <ellipse
                    cx="50%"
                    cy="50%"
                    rx="34%"
                    ry="26%"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1"
                  />
                  <ellipse
                    cx="50%"
                    cy="50%"
                    rx="46%"
                    ry="38%"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="0.8"
                    strokeDasharray="3 9"
                    opacity="0.7"
                  />
                </svg>

                <div className="absolute top-1/2 left-1/2 z-10 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center">
                  <span className="flex size-16 items-center justify-center rounded-full bg-[#3A2A25] text-sm font-medium text-[#FFF7F1] shadow-[0_12px_32px_rgba(58,42,37,0.28)] sm:size-[4.5rem]">
                    You
                  </span>
                </div>

                {ORBS.map((orb, i) => (
                  <motion.div
                    key={orb.label}
                    className="absolute z-10 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center"
                    style={{ left: orb.x, top: orb.y }}
                    animate={
                      reduceMotion
                        ? undefined
                        : { y: [0, i % 2 === 0 ? -8 : 8, 0] }
                    }
                    transition={{
                      duration: 5.5 + i * 0.6,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: i * 0.3,
                    }}
                  >
                    <span
                      className="flex size-14 items-center justify-center overflow-hidden rounded-full text-xs font-medium text-white shadow-[0_10px_24px_rgba(58,42,37,0.22)] sm:size-16"
                      style={{ background: orb.fill }}
                    >
                      {orb.label}
                    </span>
                    <span className="mt-1.5 rounded-full border border-[#F2DACE] bg-white/90 px-2 py-0.5 text-[10px] tracking-wide text-[#7A6258]">
                      {orb.caption}
                    </span>
                  </motion.div>
                ))}
              </div>

              <div className="absolute -bottom-4 left-1/2 z-20 flex w-[min(100%,22rem)] -translate-x-1/2 items-center justify-center gap-2">
                {BLOOMS.map((bloom) => (
                  <span
                    key={bloom.label}
                    className="inline-flex items-center gap-1.5 rounded-full border border-[#F2DACE] bg-white/95 px-3 py-1.5 text-[11px] font-medium text-[#C75B39] shadow-sm"
                  >
                    <bloom.icon className="size-3" />
                    {bloom.label}
                  </span>
                ))}
              </div>
            </div>
          </FadeIn>
        </div>

        <div className="mt-20 grid gap-5 md:grid-cols-3 md:gap-6">
          {PATHS.map((path, index) => (
            <FadeIn key={path.step} delay={index * 0.08}>
              <div className="kyndl-card-soft h-full rounded-3xl border border-[#F4DDD0] bg-white p-6">
                <span className="text-xs font-medium tracking-[0.18em] text-[#FF7A59] uppercase">
                  {path.step}
                </span>
                <h3 className="mt-3 font-display text-xl text-[#3A2A25]">
                  {path.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[#7A6258]">
                  {path.body}
                </p>
              </div>
            </FadeIn>
          ))}
        </div>
      </PageContainer>
    </section>
  );
}
