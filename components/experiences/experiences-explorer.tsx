"use client";

import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

import { ExperienceScene } from "@/components/experiences/experience-scene";
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
  const grouped = groupByCategory(experiences);

  return (
    <div className="space-y-20 md:space-y-24">
      {grouped.map(({ category: cat, items }) => {
        return (
          <section
            key={cat.id}
            id={cat.id}
            aria-labelledby={`cat-${cat.id}`}
            className="scroll-mt-24"
          >
            <div className="flex flex-col gap-2 border-b border-[#F2DACE] pb-5">
              <p className="text-xs font-medium tracking-[0.22em] text-[#C75B39] uppercase">
                {cat.eyebrow}
              </p>
              <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
                <h2
                  id={`cat-${cat.id}`}
                  className="font-display text-2xl text-[#3A2A25] sm:text-3xl"
                >
                  {cat.label}
                </h2>
                <p className="max-w-md text-sm leading-relaxed text-[#7A6258]">
                  {cat.blurb}
                </p>
              </div>
            </div>

            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
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
  const live = exp.status === "live";

  const card = (
    <>
      {/* the scene — shows what the experience *is* at a glance */}
      <div className="relative">
        <ExperienceScene exp={exp} />
        {/* icon chip */}
        <span className="absolute left-4 top-4 flex size-11 items-center justify-center rounded-2xl border border-white/60 bg-white/85 text-[#FF7A59] shadow-sm backdrop-blur-sm">
          <ExperienceIcon name={exp.icon} className="size-5" />
        </span>
        {/* status */}
        <span
          className={cn(
            "absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-medium tracking-wider uppercase backdrop-blur-sm",
            live
              ? "border border-[#FF7A59]/30 bg-white/85 text-[#C75B39]"
              : "border border-[#3A2A25]/10 bg-white/80 text-[#92786C]",
          )}
        >
          {live && <span className="size-1.5 rounded-full bg-[#2fb672]" />}
          {live ? "Live" : "Coming soon"}
        </span>
      </div>

      {/* body */}
      <div className="flex flex-1 flex-col p-6">
        <p className="text-[11px] font-medium tracking-[0.18em] text-[#C75B39]/80 uppercase">
          {exp.eyebrow}
        </p>
        <h3 className="mt-1.5 font-display text-xl text-[#3A2A25]">{exp.name}</h3>
        <p className="mt-2 text-sm leading-relaxed text-[#7A6258]">
          {exp.tagline}
        </p>

        {/* concrete feature chips — what you actually get */}
        {exp.highlights.length > 0 && (
          <ul className="mt-4 flex flex-wrap gap-1.5">
            {exp.highlights.slice(0, 3).map((h) => (
              <li
                key={h.title}
                className="inline-flex items-center gap-1.5 rounded-full border border-[#F4DDD0] bg-[#FFF7F1] px-2.5 py-1 text-[11px] font-medium text-[#92786C]"
              >
                <ExperienceIcon name={h.icon} className="size-3 text-[#FF7A59]" />
                {h.title}
              </li>
            ))}
          </ul>
        )}

        <div className="mt-6 flex items-center justify-between gap-3 pt-1">
          {live ? (
            <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#C75B39]">
              Explore
              <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </span>
          ) : (
            <span className="text-sm font-medium text-[#B5A096]">
              In the works
            </span>
          )}
          <ExperiencePrice price={exp.price} variant="tag" />
        </div>
      </div>
    </>
  );

  return (
    <motion.article
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-48px" }}
      transition={{ delay: index * 0.06, duration: 0.55, ease }}
      className={cn(
        "kyndl-card-soft group relative flex h-full flex-col overflow-hidden rounded-3xl border border-[#F4DDD0] bg-white transition-all duration-500",
        live
          ? "hover:-translate-y-1 hover:border-[#FF7A59]/45 hover:shadow-[0_28px_64px_-26px_rgba(242,89,111,0.45)]"
          : "opacity-90",
      )}
    >
      {live ? (
        <Link
          href={experienceHref(exp.slug)}
          className="flex h-full flex-col focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F2596F]/50"
          aria-label={`Explore ${exp.name}`}
        >
          {card}
        </Link>
      ) : (
        <div className="flex h-full flex-col">{card}</div>
      )}
    </motion.article>
  );
}
