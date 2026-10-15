"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { FadeIn } from "@/components/animations/fade-in";
import { PageContainer } from "@/components/layout/page-container";
import { ExperienceIcon } from "@/components/shared/experience-icon";
import { ROUTES } from "@/constants/routes";
import type { ExperienceView } from "@/lib/experience-catalog";
import { experienceHref } from "@/lib/experiences";

/** Optional digital rail — kept quiet so the shop stays the hero. */
export function ShopKeepsakesRail({
  experiences,
}: {
  experiences: ExperienceView[];
}) {
  const items = experiences.slice(0, 4);
  if (items.length === 0) return null;

  return (
    <section className="border-t border-[#EFE4DA] bg-white py-16 md:py-20">
      <PageContainer size="xl">
        <FadeIn>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="font-display text-2xl tracking-tight text-[#2A1814] md:text-3xl">
                Prefer a digital keepsake?
              </h2>
              <p className="mt-2 max-w-md text-[#7A6258]">
                Scrapbooks, plaques, and proposals — personalize in minutes.
              </p>
            </div>
            <Link
              href={ROUTES.experiences}
              className="group inline-flex items-center gap-1.5 text-sm font-medium text-[#2A1814] underline-offset-4 hover:underline"
            >
              Browse keepsakes
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </FadeIn>

        <ul className="mt-8 grid gap-px bg-[#EFE4DA] sm:grid-cols-2 lg:grid-cols-4">
          {items.map((exp) => (
            <li key={exp.slug} className="bg-white">
              <Link
                href={experienceHref(exp.slug)}
                prefetch={false}
                className="group flex h-full items-start gap-3 p-5 transition-colors hover:bg-[#FFFAF6]"
              >
                <ExperienceIcon
                  name={exp.icon}
                  className="mt-0.5 size-5 shrink-0 text-[#C75B39]"
                />
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-[#2A1814] group-hover:text-[#C75B39]">
                    {exp.name}
                  </span>
                  <span className="mt-1 line-clamp-2 text-xs leading-relaxed text-[#92786C]">
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
