"use client";

import { FadeIn } from "@/components/animations/fade-in";
import { PageContainer } from "@/components/layout/page-container";

const steps = [
  {
    number: "01",
    title: "Create a moment",
    description: "Set the tone, timing, and who it's for.",
  },
  {
    number: "02",
    title: "Add your surprise",
    description: "A card, message, game, or curated gift.",
  },
  {
    number: "03",
    title: "Send emotion instantly",
    description: "They feel it the moment it's meant to land.",
  },
] as const;

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="relative border-y border-white/[0.04] py-24 md:py-32"
    >
      <PageContainer size="xl">
        <FadeIn>
          <p className="text-sm font-medium tracking-[0.2em] text-[#D4A373] uppercase">
            How Kyndl works
          </p>
        </FadeIn>
        <div className="mt-16 grid gap-16 md:grid-cols-3 md:gap-8 lg:gap-12">
          {steps.map((step, index) => (
            <FadeIn key={step.number} delay={index * 0.1}>
              <div className="relative">
                {index < steps.length - 1 && (
                  <div
                    className="absolute top-8 left-[calc(100%+1rem)] hidden h-px w-8 bg-gradient-to-r from-[#B11226]/50 to-transparent md:block lg:w-16"
                    aria-hidden
                  />
                )}
                <span className="font-display text-6xl text-[#151515] md:text-7xl lg:text-8xl">
                  {step.number}
                </span>
                <h3 className="mt-4 font-display text-2xl text-[#F5E9E2] md:text-3xl">
                  {step.title}
                </h3>
                <p className="mt-3 max-w-xs text-[#B3B3B3]">
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
