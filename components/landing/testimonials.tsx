"use client";

import { motion } from "framer-motion";

import { FadeIn } from "@/components/animations/fade-in";
import { PageContainer } from "@/components/layout/page-container";
import { testimonials } from "@/lib/brand";

export function Testimonials() {
  return (
    <section className="relative py-24 md:py-32">
      <PageContainer size="xl">
        <FadeIn>
          <p className="text-center text-sm font-medium tracking-[0.2em] text-[#D4A373] uppercase">
            Moments shared
          </p>
        </FadeIn>
        <div className="mt-14 grid gap-6 md:grid-cols-3 md:gap-8">
          {testimonials.map((item, index) => (
            <motion.blockquote
              key={item.quote}
              className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-[#111111]/80 p-8 backdrop-blur-sm"
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
                className="pointer-events-none absolute -right-8 -top-8 size-32 rounded-full opacity-30"
                style={{
                  background:
                    "radial-gradient(circle, #B11226 0%, transparent 70%)",
                }}
                aria-hidden
              />
              <p className="relative font-display text-xl leading-relaxed text-[#F5E9E2] md:text-2xl">
                &ldquo;{item.quote}&rdquo;
              </p>
              <footer className="relative mt-6 text-sm text-[#B3B3B3]">
                {item.attribution}
              </footer>
            </motion.blockquote>
          ))}
        </div>
      </PageContainer>
    </section>
  );
}
