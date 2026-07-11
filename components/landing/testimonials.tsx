"use client";

import { motion } from "framer-motion";
import { Quote } from "lucide-react";

import { FadeIn } from "@/components/animations/fade-in";
import { PageContainer } from "@/components/layout/page-container";
import { testimonials } from "@/lib/brand";

export function Testimonials() {
  return (
    <section className="relative py-24 md:py-32">
      <PageContainer size="xl">
        <FadeIn>
          <p className="text-center text-sm font-medium tracking-[0.2em] text-[#C75B39] uppercase">
            Moments shared
          </p>
          <h2 className="mx-auto mt-4 max-w-2xl text-center font-display text-3xl text-[#3A2A25] md:text-4xl lg:text-5xl">
            The reactions are the
            <span className="kyndl-text-warm"> whole point.</span>
          </h2>
        </FadeIn>

        <div className="mt-14 grid gap-6 md:grid-cols-3 md:gap-8">
          {testimonials.map((item, index) => (
            <motion.blockquote
              key={item.quote}
              className="kyndl-card-soft relative overflow-hidden rounded-3xl border border-[#F4DDD0] bg-white p-8"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{
                delay: index * 0.12,
                duration: 0.6,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <div
                className="pointer-events-none absolute -top-8 -right-8 size-32 rounded-full opacity-60"
                style={{
                  background:
                    "radial-gradient(circle, rgba(255,160,120,0.5) 0%, transparent 70%)",
                }}
                aria-hidden
              />
              <Quote
                className="relative size-7 fill-[#FF7A59]/15 text-[#FF7A59]"
                aria-hidden
              />
              <p className="relative mt-4 font-display text-xl leading-relaxed text-[#3A2A25] md:text-2xl">
                {item.quote}
              </p>
              <footer className="relative mt-6 text-sm text-[#92786C]">
                {item.attribution}
              </footer>
            </motion.blockquote>
          ))}
        </div>
      </PageContainer>
    </section>
  );
}
