"use client";

import { motion } from "framer-motion";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import Link from "next/link";

import { FadeIn } from "@/components/animations/fade-in";
import { KyndlButton } from "@/components/landing/kyndl-button";
import { PageContainer } from "@/components/layout/page-container";
import { ExperienceIcon } from "@/components/shared/experience-icon";
import { ExperiencePrice } from "@/components/shared/experience-price";
import { ROUTES } from "@/constants/routes";
import { experienceHref } from "@/lib/experiences";
import type { ExperienceView } from "@/lib/server/experiences";
import { cn } from "@/lib/utils";

const spanClass: Record<string, string> = {
  feature: "lg:col-span-3 lg:row-span-2",
  wide: "lg:col-span-3",
  small: "lg:col-span-2",
};

const ease = [0.22, 1, 0.36, 1] as const;

export function ExperienceGallery({
  experiences,
}: {
  /** Live, visible experiences in backend display order (see `getFeaturedExperiencesView`). */
  experiences: ExperienceView[];
}) {
  return (
    <section id="experiences" className="relative py-24 md:py-32">
      <div
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          background:
            "radial-gradient(ellipse 42% 34% at 18% 14%, rgba(255,160,120,0.28) 0%, transparent 72%), radial-gradient(ellipse 38% 32% at 84% 82%, rgba(242,89,111,0.22) 0%, transparent 72%)",
        }}
        aria-hidden
      />
      <PageContainer size="xl" className="relative">
        <FadeIn>
          <p className="text-center text-sm font-medium tracking-[0.2em] text-[#C75B39] uppercase">
            The experiences
          </p>
          <h2 className="mx-auto mt-4 max-w-3xl text-center font-display text-3xl leading-tight text-[#3A2A25] md:text-4xl lg:text-5xl">
            Not a card you read.
            <br />
            <span className="kyndl-text-warm">A world you step into.</span>
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-center text-[#7A6258]">
            Every Kyndl is a little crafted place — turn the pages, walk the
            lane, open the jar. Try any one of them live, right now.
          </p>
        </FadeIn>

        <div className="mt-14 grid auto-rows-[minmax(11rem,1fr)] grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-6">
          {experiences.map((exp, index) => {
            const isFeature = exp.span === "feature";
            return (
              <motion.div
                key={exp.slug}
                className={cn(spanClass[exp.span] ?? "lg:col-span-2")}
                initial={{ opacity: 0, y: 22 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-48px" }}
                transition={{ delay: index * 0.06, duration: 0.55, ease }}
              >
                <Link
                  href={experienceHref(exp.slug)}
                  className={cn(
                    "kyndl-card-soft group relative flex h-full flex-col overflow-hidden rounded-3xl border border-[#F4DDD0] bg-white p-6 md:p-7",
                    "transition-all duration-500 hover:-translate-y-1 hover:border-[#FF7A59]/45 hover:shadow-[0_28px_64px_-26px_rgba(242,89,111,0.45)]",
                  )}
                >
                  {/* accent wash on hover */}
                  <div
                    className={cn(
                      "pointer-events-none absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-500 group-hover:opacity-100",
                      exp.accent,
                    )}
                    aria-hidden
                  />

                  {/* soft bloom on the feature tile */}
                  {isFeature && (
                    <div
                      className="pointer-events-none absolute -top-10 -right-10 size-48 rounded-full opacity-70 blur-2xl"
                      style={{
                        background:
                          "radial-gradient(circle, rgba(255,160,120,0.5) 0%, transparent 70%)",
                      }}
                      aria-hidden
                    />
                  )}

                  <div className="relative flex items-start justify-between">
                    <span
                      className={cn(
                        "flex items-center justify-center rounded-2xl border border-[#F4DDD0] bg-[#FFF7F1] text-[#FF7A59] transition-colors duration-500 group-hover:border-[#FF7A59]/40 group-hover:text-[#F2596F]",
                        isFeature ? "size-14" : "size-11",
                      )}
                    >
                      <ExperienceIcon
                        name={exp.icon}
                        className={isFeature ? "size-7" : "size-5"}
                      />
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-[#FF7A59]/30 bg-[#FFF1E9] px-3 py-1 text-[11px] font-medium tracking-wider text-[#C75B39] uppercase">
                      <span className="size-1.5 rounded-full bg-[#2fb672]" />
                      Live
                    </span>
                  </div>

                  <div className="relative mt-auto pt-8">
                    <h3
                      className={cn(
                        "font-display text-[#3A2A25]",
                        isFeature ? "text-2xl md:text-3xl" : "text-xl",
                      )}
                    >
                      {exp.name}
                    </h3>
                    <p
                      className={cn(
                        "mt-2 leading-relaxed text-[#7A6258]",
                        isFeature ? "max-w-md text-base" : "text-sm",
                      )}
                    >
                      {exp.tagline}
                    </p>
                    <div className="mt-4 flex items-center justify-between gap-3">
                      <span className="inline-flex items-center gap-1.5 text-sm font-medium text-[#C75B39]">
                        Explore
                        <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                      </span>
                      <ExperiencePrice price={exp.price} variant="tag" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>

        <FadeIn delay={0.1}>
          <div className="mt-12 flex justify-center">
            <KyndlButton
              variant="secondary"
              size="lg"
              href={ROUTES.experiences}
              className="group"
            >
              View all experiences
              <ArrowRight className="ml-2 size-4 transition-transform duration-300 group-hover:translate-x-1" />
            </KyndlButton>
          </div>
        </FadeIn>
      </PageContainer>
    </section>
  );
}
