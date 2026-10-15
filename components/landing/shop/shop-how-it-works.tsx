"use client";

import { Package, ShoppingBag, Truck } from "lucide-react";

import { FadeIn } from "@/components/animations/fade-in";
import { PageContainer } from "@/components/layout/page-container";

const steps = [
  {
    number: "01",
    icon: ShoppingBag,
    title: "Pick a piece",
    description:
      "Browse jewellery, keepsakes, and gifts — filter by shelf or search by feeling.",
  },
  {
    number: "02",
    icon: Package,
    title: "Checkout in minutes",
    description:
      "Secure payment, your address saved for next time. No account gymnastics.",
  },
  {
    number: "03",
    icon: Truck,
    title: "It arrives with care",
    description:
      "Vendors pack and ship. Track the parcel until it’s in their hands.",
  },
] as const;

export function ShopHowItWorks() {
  return (
    <section className="relative border-y border-[#F2DACE] bg-[#FCEEE3]/50 py-20 md:py-28">
      <PageContainer size="xl">
        <FadeIn>
          <p className="text-center text-sm font-medium tracking-[0.2em] text-[#C75B39] uppercase">
            How shopping works
          </p>
          <h2 className="mx-auto mt-4 max-w-2xl text-center font-display text-3xl text-[#3A2A25] md:text-4xl">
            From the shelf to their door,
            <br />
            <span className="text-[#B08C7D]">without the fuss.</span>
          </h2>
        </FadeIn>

        <ol className="relative mt-14 grid gap-10 md:grid-cols-3 md:gap-8">
          <div
            className="absolute top-12 left-[16%] right-[16%] hidden h-px bg-gradient-to-r from-[#D4A373]/50 via-[#C75B39]/40 to-[#D4A373]/50 md:block"
            aria-hidden
          />
          {steps.map((step, index) => (
            <FadeIn key={step.number} delay={index * 0.1}>
              <li className="relative flex flex-col items-center text-center md:items-start md:text-left">
                <div className="relative flex size-14 items-center justify-center rounded-2xl border border-[#F4DDD0] bg-white text-[#C75B39]">
                  <step.icon className="size-6" />
                </div>
                <p className="mt-5 text-xs font-semibold tracking-[0.18em] text-[#B08C7D]">
                  {step.number}
                </p>
                <h3 className="mt-2 font-display text-xl text-[#3A2A25]">
                  {step.title}
                </h3>
                <p className="mt-2 max-w-xs text-sm leading-relaxed text-[#7A6258]">
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
