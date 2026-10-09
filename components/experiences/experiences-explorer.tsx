"use client";

import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

import {
  ExperienceDoodles,
  SectionDoodle,
} from "@/components/experiences/experience-doodles";
import { ExperienceCardMedia } from "@/components/shared/experience-card-media";
import { ExperienceIcon } from "@/components/shared/experience-icon";
import { ExperiencePrice } from "@/components/shared/experience-price";
// Grouping comes from the shared taxonomy — the same source the header mega-menu
// and footer use — so the site's "shelves" can never drift between surfaces.
import { groupByCategory } from "@/constants/experience-taxonomy";
import { experienceHref } from "@/lib/experiences";
import type { ExperienceView } from "@/lib/server/experiences";
import { cn } from "@/lib/utils";

const ease = [0.22, 1, 0.36, 1] as const;

export function ExperiencesExplorer({
  experiences,
}: {
  experiences: ExperienceView[];
}) {
  const grouped = groupByCategory(
    experiences.filter((exp) => exp.status === "live"),
  );

  return (
    <div className="relative space-y-16 md:space-y-20">
      <ExperienceDoodles />

      {grouped.map(({ category: cat, items }, catIndex) => {
        return (
          <section
            key={cat.id}
            id={cat.id}
            aria-labelledby={`cat-${cat.id}`}
            className="relative scroll-mt-24"
          >
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
              <div className="flex items-center gap-2.5">
                <SectionDoodle variant={catIndex} />
                <div>
                  <p className="text-xs font-medium tracking-[0.22em] text-[#C75B39] uppercase">
                    {cat.eyebrow}
                  </p>
                  <h2
                    id={`cat-${cat.id}`}
                    className="mt-1 font-display text-2xl text-[#3A2A25] sm:text-3xl"
                  >
                    {cat.label}
                  </h2>
                </div>
              </div>
              <p className="max-w-sm text-sm leading-relaxed text-[#7A6258]">
                {cat.blurb}
              </p>
            </div>

            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
              {items.map((exp, index) => (
                <ExperienceCard key={exp.slug} exp={exp} index={index} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

function ExperienceCard({
  exp,
  index,
}: {
  exp: ExperienceView;
  index: number;
}) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-48px" }}
      transition={{ delay: Math.min(index, 5) * 0.06, duration: 0.55, ease }}
      className="kyndl-card-soft group relative flex h-full flex-col overflow-hidden rounded-3xl border border-[#F4DDD0] bg-white p-6 transition-all duration-500 hover:-translate-y-1 hover:border-[#FF7A59]/45 hover:shadow-[0_28px_64px_-26px_rgba(242,89,111,0.45)]"
    >
      <Link
        href={experienceHref(exp.slug)}
        className="relative flex h-full flex-col focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F2596F]/50"
        aria-label={`Explore ${exp.name}`}
      >
        <div
          className={cn(
            "pointer-events-none absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-500 group-hover:opacity-100",
            exp.accent,
          )}
          aria-hidden
        />

        <div className="relative flex items-start justify-between">
          <span className="flex size-11 items-center justify-center rounded-2xl border border-[#F4DDD0] bg-[#FFF7F1] text-[#FF7A59] transition-colors duration-500 group-hover:border-[#FF7A59]/40 group-hover:text-[#F2596F]">
            <ExperienceIcon name={exp.icon} className="size-5" />
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#FF7A59]/30 bg-[#FFF1E9] px-3 py-1 text-[11px] font-medium tracking-wider text-[#C75B39] uppercase">
            <span className="size-1.5 rounded-full bg-[#2fb672]" />
            Live
          </span>
        </div>

        <ExperienceCardMedia
          slug={exp.slug}
          media={exp}
          className="mt-5 rounded-2xl"
        />

        <div className="relative mt-5 flex flex-1 flex-col">
          <h3 className="font-display text-xl text-[#3A2A25]">{exp.name}</h3>
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-[#7A6258]">
            {exp.tagline}
          </p>
          <div className="mt-auto flex items-center justify-between gap-3 pt-5">
            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-[#C75B39]">
              Explore
              <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </span>
            <ExperiencePrice price={exp.price} variant="tag" />
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
