"use client";

import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { FadeIn } from "@/components/animations/fade-in";
import { KyndlButton } from "@/components/landing/kyndl-button";
import { PageContainer } from "@/components/layout/page-container";
import { ExperienceCardMedia } from "@/components/shared/experience-card-media";
import { ExperienceIcon } from "@/components/shared/experience-icon";
import { ExperiencePrice } from "@/components/shared/experience-price";
import { ROUTES } from "@/constants/routes";
import { ideaHref } from "@/features/ideas/idea-href";
import { experienceHref } from "@/lib/experiences";
import type { ExperienceView } from "@/lib/server/experiences";
import { cn } from "@/lib/utils";

const ease = [0.22, 1, 0.36, 1] as const;

export function ExperienceGallery({
  experiences,
}: {
  /** Live, visible experiences in backend display order (see `getFeaturedExperiencesView`). */
  experiences: ExperienceView[];
}) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;

    const update = () => {
      const cards = Array.from(el.children) as HTMLElement[];
      if (cards.length === 0) return;

      const mid = el.scrollLeft + el.clientWidth / 2;
      let nearest = 0;
      let nearestDist = Infinity;
      cards.forEach((card, i) => {
        const center = card.offsetLeft + card.offsetWidth / 2;
        const dist = Math.abs(center - mid);
        if (dist < nearestDist) {
          nearestDist = dist;
          nearest = i;
        }
      });
      setActive(nearest);
      setCanPrev(el.scrollLeft > 8);
      setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 8);
    };

    update();
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [experiences.length]);

  const scrollByCard = (dir: -1 | 1) => {
    const el = scrollerRef.current;
    if (!el) return;
    const card = el.children[0] as HTMLElement | undefined;
    const step = card ? card.offsetWidth + 20 : el.clientWidth * 0.8;
    el.scrollBy({ left: dir * step, behavior: "smooth" });
  };

  const scrollToIndex = (index: number) => {
    const el = scrollerRef.current;
    const card = el?.children[index] as HTMLElement | undefined;
    if (!el || !card) return;
    el.scrollTo({
      left: card.offsetLeft - (el.clientWidth - card.offsetWidth) / 2,
      behavior: "smooth",
    });
  };

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
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl">
              <p className="text-sm font-medium tracking-[0.2em] text-[#C75B39] uppercase">
                The experiences
              </p>
              <h2 className="mt-4 font-display text-3xl leading-tight text-[#3A2A25] md:text-4xl lg:text-5xl">
                Not a card you read.
                <br />
                <span className="kyndl-text-warm">A world you step into.</span>
              </h2>
              <p className="mt-5 text-[#7A6258]">
                Grow them from your Memory Bank, or start any one from scratch.
                Turn the pages, walk the lane, open the jar — try them live,
                right now.
              </p>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                type="button"
                aria-label="Previous experiences"
                disabled={!canPrev}
                onClick={() => scrollByCard(-1)}
                className={cn(
                  "flex size-11 items-center justify-center rounded-full border border-[#F4DDD0] bg-white text-[#3A2A25] transition-all duration-300",
                  "hover:border-[#FF7A59]/45 hover:text-[#C75B39]",
                  "disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:border-[#F4DDD0] disabled:hover:text-[#3A2A25]",
                )}
              >
                <ArrowLeft className="size-4" />
              </button>
              <button
                type="button"
                aria-label="Next experiences"
                disabled={!canNext}
                onClick={() => scrollByCard(1)}
                className={cn(
                  "flex size-11 items-center justify-center rounded-full border border-[#F4DDD0] bg-white text-[#3A2A25] transition-all duration-300",
                  "hover:border-[#FF7A59]/45 hover:text-[#C75B39]",
                  "disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:border-[#F4DDD0] disabled:hover:text-[#3A2A25]",
                )}
              >
                <ArrowRight className="size-4" />
              </button>
            </div>
          </div>
        </FadeIn>

        <div className="relative mt-12">
          <div
            ref={scrollerRef}
            className="scrollbar-hide -mx-4 flex snap-x snap-mandatory gap-5 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:px-6 lg:-mx-8 lg:gap-6 lg:px-8"
            style={{ scrollPaddingInline: "1rem" }}
          >
            {experiences.map((exp, index) => (
              <motion.div
                key={exp.slug}
                className="w-[min(100%,20.5rem)] shrink-0 snap-center sm:w-[22rem]"
                initial={{ opacity: 0, y: 22 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-48px" }}
                transition={{
                  delay: Math.min(index, 4) * 0.06,
                  duration: 0.55,
                  ease,
                }}
              >
                <Link
                  href={experienceHref(exp.slug)}
                  className={cn(
                    "kyndl-card-soft group relative flex h-full min-h-[28rem] flex-col overflow-hidden rounded-3xl border border-[#F4DDD0] bg-white p-6",
                    "transition-all duration-500 hover:-translate-y-1 hover:border-[#FF7A59]/45 hover:shadow-[0_28px_64px_-26px_rgba(242,89,111,0.45)]",
                  )}
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
                    <h3 className="font-display text-xl text-[#3A2A25]">
                      {exp.name}
                    </h3>
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
              </motion.div>
            ))}
          </div>
        </div>

        {experiences.length > 1 ? (
          <div
            className="mt-8 flex items-center justify-center gap-2"
            role="tablist"
            aria-label="Experience slides"
          >
            {experiences.map((exp, index) => (
              <button
                key={exp.slug}
                type="button"
                role="tab"
                aria-selected={active === index}
                aria-label={`Go to ${exp.name}`}
                onClick={() => scrollToIndex(index)}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300",
                  active === index
                    ? "w-7 bg-[#FF7A59]"
                    : "w-1.5 bg-[#F0DAC9] hover:bg-[#E0C4B0]",
                )}
              />
            ))}
          </div>
        ) : null}

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
            <p className="mt-5 text-center text-sm text-[#7A6258]">
              Don&apos;t see the one you wanted?{" "}
              <Link
                href={ideaHref({ source: "homepage" })}
                className="font-medium text-[#C75B39] underline-offset-4 hover:underline"
              >
                Tell us — we&apos;ll try to figure it out.
              </Link>
            </p>
          </div>
        </FadeIn>
      </PageContainer>
    </section>
  );
}
