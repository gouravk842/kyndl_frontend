"use client";

import { FadeIn } from "@/components/animations/fade-in";
import { PageContainer } from "@/components/layout/page-container";

const steps = [
  {
    number: "01",
    title: "Find the piece",
    description:
      "Browse jewellery, keepsakes, and gifts — by shelf or occasion.",
  },
  {
    number: "02",
    title: "Checkout calmly",
    description: "Secure pay, saved addresses, no account gymnastics.",
  },
  {
    number: "03",
    title: "They unwrap it",
    description: "Packed with care, tracked to their door.",
  },
] as const;

export function ShopHowItWorks() {
  return (
    <section className="bg-[#FFFAF6] py-20 md:py-24">
      <PageContainer size="xl">
        <FadeIn>
          <h2 className="mx-auto max-w-xl text-center font-display text-3xl tracking-tight text-[#2A1814] md:text-[2.35rem]">
            Simple from click to doorstep
          </h2>
        </FadeIn>

        <ol className="mt-14 grid gap-10 md:grid-cols-3 md:gap-12">
          {steps.map((step, index) => (
            <FadeIn key={step.number} delay={index * 0.08}>
              <li className="text-center md:text-left">
                <p className="font-display text-sm tracking-[0.2em] text-[#B08C7D]">
                  {step.number}
                </p>
                <h3 className="mt-3 font-display text-xl text-[#2A1814]">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[#7A6258] md:max-w-xs">
                  {step.description}
                </p>
              </li>
            </FadeIn>
          ))}
        </ol>
      </PageContainer>
    </section>
  );
}
