"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { FadeIn } from "@/components/animations/fade-in";
import { PageContainer } from "@/components/layout/page-container";
import { ExperienceIcon } from "@/components/shared/experience-icon";
import { ROUTES } from "@/constants/routes";
import type { ExperienceView } from "@/lib/experience-catalog";
import { experienceHref } from "@/lib/experiences";

/** Compact digital-keepsake rail under the physical shop — optional in v2. */
export function ShopKeepsakesRail({
  experiences,
}: {
  experiences: ExperienceView[];
}) {
  const items = experiences.slice(0, 6);
  if (items.length === 0) return null;

  return (
    <section className="relative py-16 md:py-20">
      <PageContainer size="xl">
        <FadeIn>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm font-medium tracking-[0.2em] text-[#C75B39] uppercase">
                Also digital
              </p>
              <h2 className="mt-3 font-display text-3xl text-[#3A2A25] md:text-4xl">
                Keepsakes that arrive as a link.
              </h2>
              <p className="mt-3 max-w-lg text-[#7A6258]">
                Scrapbooks, plaques, proposals — personalize in minutes when a
                parcel isn’t the point.
              </p>
            </div>
            <Link
              href={ROUTES.experiences}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#C75B39] hover:text-[#9e3f21]"
            >
              Browse all
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </FadeIn>

        <ul className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((exp) => (
            <li key={exp.slug}>
              <Link
                href={experienceHref(exp.slug)}
                prefetch={false}
                className="group flex items-center gap-4 border-b border-[#F2DACE] py-4 transition-colors hover:border-[#C75B39]/45"
              >
                <span className="flex size-11 shrink-0 items-center justify-center text-[#FF7A59]">
                  <ExperienceIcon name={exp.icon} className="size-5" />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-[#3A2A25] group-hover:text-[#C75B39]">
                    {exp.name}
                  </span>
                  <span className="mt-0.5 line-clamp-1 text-xs text-[#92786C]">
                    {exp.tagline}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </PageContainer>
    </section>
  );
}
