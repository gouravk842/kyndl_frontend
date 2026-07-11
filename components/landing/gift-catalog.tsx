"use client";

import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";

import { FadeIn } from "@/components/animations/fade-in";
import { KyndlButton } from "@/components/landing/kyndl-button";
import { PageContainer } from "@/components/layout/page-container";
import { ROUTES } from "@/constants/routes";
import { giftCollections } from "@/lib/brand";
import { cn } from "@/lib/utils";

const occasions = [
  "Anniversary",
  "Birthday",
  "Long-distance",
  "Just because",
  "Apology",
  "Proposal",
] as const;

export function GiftCatalog() {
  return (
    <section id="gift-catalog" className="relative py-24 md:py-32">
      <div
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          background:
            "radial-gradient(ellipse 42% 32% at 20% 20%, rgba(255,160,120,0.3) 0%, transparent 72%), radial-gradient(ellipse 35% 30% at 82% 70%, rgba(242,89,111,0.22) 0%, transparent 72%)",
        }}
        aria-hidden
      />
      <PageContainer size="xl" className="relative">
        <FadeIn>
          <p className="text-center text-sm font-medium tracking-[0.2em] text-[#C75B39] uppercase">
            Gift Collections
          </p>
          <h2 className="mt-4 text-center font-display text-3xl text-[#3A2A25] md:text-4xl lg:text-5xl">
            Pick the experience,
            <br />
            <span className="text-[#B08C7D]">then make it personal.</span>
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-center text-[#7A6258]">
            Built for emotional gifting: digital cards, digital games, and
            custom surprise flows your loved one can feel, not just read.
          </p>
        </FadeIn>

        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          {giftCollections.map((collection, index) => (
            <motion.article
              key={collection.id}
              className={cn(
                "kyndl-card-soft group relative overflow-hidden rounded-3xl border border-[#F4DDD0] bg-white p-7",
                "transition-all duration-500 hover:-translate-y-1 hover:border-[#FF7A59]/45",
              )}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-64px" }}
              transition={{
                delay: index * 0.08,
                duration: 0.6,
                ease: [0.22, 1, 0.36, 1],
              }}
              whileHover={{ rotateX: 1.4, rotateY: -1.4 }}
              style={{ transformStyle: "preserve-3d" }}
            >
              <div
                className={cn(
                  "pointer-events-none absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-500 group-hover:opacity-100",
                  collection.accent,
                )}
              />
              <div className="relative">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="inline-flex rounded-full border border-[#FF7A59]/30 bg-[#FFF1E9] px-3 py-1 text-[11px] font-medium tracking-wider text-[#C75B39] uppercase">
                      {collection.tag}
                    </span>
                    <h3 className="mt-4 font-display text-2xl text-[#3A2A25]">
                      {collection.title}
                    </h3>
                  </div>
                  <span className="text-sm font-medium text-[#FF7A59]">
                    {collection.priceFrom}
                  </span>
                </div>

                <p className="mt-4 text-sm leading-relaxed text-[#7A6258]">
                  {collection.description}
                </p>

                <div className="mt-6 flex flex-wrap gap-2">
                  {collection.features.map((feature) => (
                    <span
                      key={feature}
                      className="rounded-full border border-[#F4DDD0] bg-[#FFF7F1] px-3 py-1 text-xs text-[#7A6258]"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            </motion.article>
          ))}
        </div>

        <FadeIn delay={0.12}>
          <div className="mt-12 rounded-3xl border border-[#F4DDD0] bg-gradient-to-br from-[#FFF1E9] to-[#FDEBE6] p-6 md:p-8">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="flex items-center gap-2 text-sm font-medium tracking-[0.14em] text-[#C75B39] uppercase">
                  <Sparkles className="size-4" /> Occasion presets
                </p>
                <p className="mt-3 max-w-2xl text-sm text-[#7A6258]">
                  Start from a ready-made emotional script, then customize the
                  names, story, visuals, and surprise timing in under 3 minutes.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {occasions.map((occasion) => (
                    <span
                      key={occasion}
                      className="rounded-full border border-[#F2DACE] bg-white/70 px-3 py-1 text-xs text-[#7A6258]"
                    >
                      {occasion}
                    </span>
                  ))}
                </div>
              </div>
              <KyndlButton href={ROUTES.register} className="group">
                Start Customizing
                <ArrowRight className="ml-2 size-4 transition-transform duration-300 group-hover:translate-x-0.5" />
              </KyndlButton>
            </div>
          </div>
        </FadeIn>
      </PageContainer>
    </section>
  );
}
