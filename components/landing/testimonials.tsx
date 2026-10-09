"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { FadeIn } from "@/components/animations/fade-in";
import { PageContainer } from "@/components/layout/page-container";
import { ROUTES } from "@/constants/routes";
import { StarRating } from "@/features/reviews/components/star-rating";
import { cn } from "@/lib/utils";
import type { Testimonial } from "@/types/testimonial";

const AUTO_MS = 4200;

function formatWhen(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/**
 * Light auto-scrolling carousel of approved testimonials.
 * Each card: rating · comment · experience · timestamp.
 */
export function Testimonials({ items }: { items: Testimonial[] }) {
  const reduceMotion = useReducedMotion();
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  const scrollToIndex = (index: number) => {
    const el = scrollerRef.current;
    const card = el?.children[index] as HTMLElement | undefined;
    if (!el || !card) return;
    el.scrollTo({
      left: card.offsetLeft - (el.clientWidth - card.offsetWidth) / 2,
      behavior: reduceMotion ? "auto" : "smooth",
    });
    setActive(index);
  };

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
    };

    update();
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [items.length]);

  useEffect(() => {
    if (paused || reduceMotion || items.length < 2) return;
    const id = window.setInterval(() => {
      setActive((i) => {
        const next = (i + 1) % items.length;
        requestAnimationFrame(() => {
          const el = scrollerRef.current;
          const card = el?.children[next] as HTMLElement | undefined;
          if (!el || !card) return;
          el.scrollTo({
            left: card.offsetLeft - (el.clientWidth - card.offsetWidth) / 2,
            behavior: "smooth",
          });
        });
        return next;
      });
    }, AUTO_MS);
    return () => window.clearInterval(id);
  }, [paused, reduceMotion, active, items.length]);

  const go = (dir: -1 | 1) => {
    if (items.length === 0) return;
    const next = (active + dir + items.length) % items.length;
    scrollToIndex(next);
  };

  return (
    <section
      className="relative overflow-hidden border-y border-[#F2DACE] bg-[#FFF7F1] py-24 md:py-32"
      aria-label="Moments shared"
      aria-roledescription="carousel"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
          setPaused(false);
        }
      }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          background:
            "radial-gradient(ellipse 50% 40% at 12% 20%, rgba(255,160,120,0.22) 0%, transparent 70%), radial-gradient(ellipse 45% 35% at 90% 80%, rgba(242,89,111,0.14) 0%, transparent 72%)",
        }}
        aria-hidden
      />

      <PageContainer size="xl" className="relative">
        <FadeIn>
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-xl">
              <p className="text-sm font-medium tracking-[0.2em] text-[#C75B39] uppercase">
                Moments shared
              </p>
              <h2 className="mt-4 font-display text-3xl text-[#3A2A25] md:text-4xl lg:text-5xl">
                The reactions are the
                <span className="kyndl-text-warm"> whole point.</span>
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-3 self-end sm:self-auto">
              <Link
                href={ROUTES.feedback}
                className="text-sm font-medium text-[#C75B39] underline-offset-4 transition-colors hover:text-[#F2596F] hover:underline"
              >
                Share yours
              </Link>
              {items.length > 1 ? (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    aria-label="Previous reaction"
                    onClick={() => go(-1)}
                    className="flex size-11 items-center justify-center rounded-full border border-[#F4DDD0] bg-white text-[#3A2A25] transition-all duration-300 hover:border-[#FF7A59]/45 hover:text-[#C75B39]"
                  >
                    <ArrowLeft className="size-4" />
                  </button>
                  <button
                    type="button"
                    aria-label="Next reaction"
                    onClick={() => go(1)}
                    className="flex size-11 items-center justify-center rounded-full border border-[#F4DDD0] bg-white text-[#3A2A25] transition-all duration-300 hover:border-[#FF7A59]/45 hover:text-[#C75B39]"
                  >
                    <ArrowRight className="size-4" />
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </FadeIn>
      </PageContainer>

      {items.length === 0 ? (
        <PageContainer size="md" className="relative mt-12">
          <div className="rounded-3xl border border-dashed border-[#E8D0C4] bg-white/60 px-8 py-14 text-center">
            <p className="font-display text-xl text-[#3A2A25]">
              Be the first to share a reaction.
            </p>
            <p className="mt-2 text-[#7A6258]">
              Sent a keepsake?{" "}
              <Link
                href={ROUTES.feedback}
                className="font-medium text-[#C75B39] underline-offset-2 hover:underline"
              >
                Leave feedback
              </Link>{" "}
              — we review every note.
            </p>
          </div>
        </PageContainer>
      ) : (
        <div className="relative mt-12">
          <div
            ref={scrollerRef}
            className="scrollbar-hide flex snap-x snap-mandatory gap-5 overflow-x-auto px-[max(1rem,calc((100%-22rem)/2))] pb-2 sm:gap-6 sm:px-[max(1.5rem,calc((100%-24rem)/2))]"
          >
            {items.map((item, index) => {
              const focused = index === active;
              return (
                <motion.article
                  key={item.id}
                  className={cn(
                    "kyndl-card-soft relative w-[min(100%,20.5rem)] shrink-0 snap-center overflow-hidden rounded-3xl border bg-white p-8 sm:w-[24rem] sm:p-9",
                    "transition-[border-color,box-shadow,opacity] duration-500",
                    focused
                      ? "border-[#FF7A59]/40 opacity-100 shadow-[0_28px_64px_-26px_rgba(242,89,111,0.4)]"
                      : "border-[#F4DDD0] opacity-55 sm:opacity-70",
                  )}
                  aria-roledescription="slide"
                  aria-label={`${index + 1} of ${items.length}`}
                  onClick={() => scrollToIndex(index)}
                >
                  <div className="relative flex items-center justify-between gap-3">
                    <StarRating value={item.rating} size="md" />
                    <span className="text-xs text-[#92786C]">
                      {formatWhen(item.created_at)}
                    </span>
                  </div>

                  <p className="relative mt-5 font-display text-xl leading-snug text-[#3A2A25] sm:text-2xl">
                    “{item.comment}”
                  </p>

                  <div className="relative mt-8 flex items-center justify-between gap-3 border-t border-[#F4DDD0] pt-5">
                    <div>
                      <p className="text-sm font-medium text-[#3A2A25]">
                        {item.display_name}
                      </p>
                      <p className="mt-0.5 text-xs tracking-wide text-[#C75B39] uppercase">
                        {item.experience_name}
                      </p>
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </div>

          {items.length > 1 ? (
            <div
              className="mt-8 flex items-center justify-center gap-2"
              role="tablist"
              aria-label="Carousel pages"
            >
              {items.map((item, i) => (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={i === active}
                  aria-label={`Go to reaction ${i + 1}`}
                  onClick={() => scrollToIndex(i)}
                  className={cn(
                    "h-2 rounded-full transition-all duration-300",
                    i === active
                      ? "w-7 bg-gradient-to-r from-[#FF7A59] to-[#F2596F]"
                      : "w-2 bg-[#E8D0C4] hover:bg-[#D4B8AA]",
                  )}
                />
              ))}
            </div>
          ) : null}
        </div>
      )}
    </section>
  );
}
