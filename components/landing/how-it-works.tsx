"use client";

import { Clock, PenLine, Sparkles } from "lucide-react";

import { FadeIn } from "@/components/animations/fade-in";
import { PageContainer } from "@/components/layout/page-container";

const steps = [
  {
    number: "01",
    icon: PenLine,
    title: "Keep the days",
    description:
      "Drop photos and little notes into a bank for someone you love. One place. Always growing.",
  },
  {
    number: "02",
    icon: Sparkles,
    title: "Grow a world — or start one",
    description:
      "Turn the bank into a scrapbook, a jar, a sky. Or pick a single experience and make it by hand.",
  },
  {
    number: "03",
    icon: Clock,
    title: "Send the feeling",
    description:
      "Share a private link, or let it unlock at the exact moment it will mean the most.",
  },
] as const;

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="relative border-y border-[#F2DACE] bg-[#FCEEE3]/60 py-24 md:py-32"
    >
      <PageContainer size="xl">
        <FadeIn>
          <p className="text-center text-sm font-medium tracking-[0.2em] text-[#C75B39] uppercase">
            How Kyndl works
          </p>
          <h2 className="mx-auto mt-4 max-w-2xl text-center font-display text-3xl text-[#3A2A25] md:text-4xl lg:text-5xl">
            From a kept day to a world,
            <br />
            <span className="text-[#B08C7D]">in about three minutes.</span>
          </h2>
        </FadeIn>

        <div className="relative mt-16 grid gap-10 md:grid-cols-3 md:gap-6 lg:gap-10">
          {/* connecting line behind the cards */}
          <div
            className="absolute top-12 left-[16%] right-[16%] hidden h-px bg-gradient-to-r from-[#FF7A59]/40 via-[#F2596F]/40 to-[#FF7A59]/40 md:block"
            aria-hidden
          />
          {steps.map((step, index) => (
            <FadeIn key={step.number} delay={index * 0.12}>
              <div className="relative flex flex-col items-center text-center md:items-start md:text-left">
                <div className="relative flex size-14 items-center justify-center rounded-2xl border border-[#F4DDD0] bg-white text-[#FF7A59] kyndl-card-soft">
                  <step.icon className="size-6" />
                  <span className="absolute -right-2 -top-2 flex size-6 items-center justify-center rounded-full bg-gradient-to-br from-[#FF7A59] to-[#F2596F] text-[10px] font-bold text-white">
                    {index + 1}
                  </span>
                </div>
                <h3 className="mt-5 font-display text-xl text-[#3A2A25] md:text-2xl">
                  {step.title}
                </h3>
                <p className="mt-2 max-w-xs text-[#7A6258]">
                  {step.description}
                </p>
              </div>
            </FadeIn>
          ))}
        </div>
      </PageContainer>
    </section>
  );
}
