"use client";

import { motion } from "framer-motion";

import { FadeIn } from "@/components/animations/fade-in";
import { PageContainer } from "@/components/layout/page-container";
import { experiences } from "@/lib/brand";
import { cn } from "@/lib/utils";

export function ExperienceStrip() {
  return (
    <section id="experiences" className="relative py-24 md:py-32">
      <PageContainer size="xl">
        <FadeIn>
          <p className="text-center text-sm font-medium tracking-[0.2em] text-[#C75B39] uppercase">
            Experiences
          </p>
          <h2 className="mt-4 text-center font-display text-3xl text-[#3A2A25] md:text-4xl lg:text-5xl">
            More than gifting.
            <br />
            <span className="text-[#B08C7D]">Warmth, by design.</span>
          </h2>
        </FadeIn>

        <div className="mt-14 -mx-4 overflow-x-auto px-4 scrollbar-hide sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
          <div className="flex gap-5 pb-4 md:gap-6">
            {experiences.map((item, index) => (
              <motion.article
                key={item.id}
                className={cn(
                  "kyndl-card-soft group relative w-[280px] shrink-0 overflow-hidden rounded-2xl border border-[#F4DDD0]",
                  "bg-white p-6 transition-all duration-500 md:w-[300px]",
                  "hover:-translate-y-1 hover:border-[#FF7A59]/40 hover:shadow-[0_24px_60px_-22px_rgba(242,89,111,0.4)]",
                )}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{
                  delay: index * 0.06,
                  duration: 0.5,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                <div
                  className={cn(
                    "pointer-events-none absolute inset-0 bg-gradient-to-t opacity-0 transition-opacity duration-500 group-hover:opacity-100",
                    item.accent,
                  )}
                />
                <div className="relative">
                  <span className="text-xs font-medium tracking-wider text-[#FF7A59] uppercase">
                    0{index + 1}
                  </span>
                  <h3 className="mt-3 font-display text-xl text-[#3A2A25]">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-[#7A6258]">
                    {item.description}
                  </p>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </PageContainer>
    </section>
  );
}
