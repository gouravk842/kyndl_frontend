"use client";

import { useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { ExperienceCardMedia } from "@/components/shared/experience-card-media";
import { formatPrice } from "@/lib/gifts";
import { cn } from "@/lib/utils";
import { track } from "@/services/analytics/analytics.service";
import { recommendationService } from "@/services/recommendations/recommendation.service";
import type { RecommendationItem } from "@/types/recommendation";

const AUTO_MS = 3800;

export function RecommendationCard({
  item,
  rank,
  context,
  className,
}: {
  item: RecommendationItem;
  rank?: number;
  context: string;
  className?: string;
}) {
  const priceLabel =
    item.is_free || item.price === 0 ? "Free" : formatPrice(item.price);

  return (
    <Link
      href={item.href}
      onClick={() => {
        void recommendationService.trackEvents([
          {
            context,
            action: "click",
            kind: item.kind,
            id: item.id,
            rank,
          },
        ]);
        track({
          name: "recommendation.clicked",
          properties: { context, kind: item.kind, id: item.id, rank },
        });
        track({
          name: "product.viewed",
          properties: {
            kind: item.kind,
            id: item.id,
            source: "recommendation",
          },
        });
      }}
      className={cn(
        "group flex flex-col overflow-hidden rounded-2xl bg-[#FFF8F4]/80 ring-1 ring-[#F4DDD0] transition hover:ring-[#E8B4A0]",
        className,
      )}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-[#FDEBE6]">
        {item.kind === "digital" ? (
          <ExperienceCardMedia
            slug={item.id}
            className="size-full object-cover"
          />
        ) : item.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.image_url}
            alt=""
            className="size-full object-cover transition duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex size-full items-center justify-center text-sm text-[#C75B39]/70">
            {item.kind === "physical" ? "Gift" : "Experience"}
          </div>
        )}
        <span className="absolute top-3 left-3 rounded-full bg-[#3A2A25]/85 px-2.5 py-1 text-[10px] font-medium tracking-[0.14em] text-[#FFF8F4] uppercase">
          {item.kind === "digital" ? "Digital" : "Physical"}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <h3 className="font-display text-lg text-[#3A2A25]">{item.name}</h3>
        {item.tagline ? (
          <p className="line-clamp-2 text-sm text-[#7A6258]">{item.tagline}</p>
        ) : null}
        <p className="mt-auto pt-2 text-sm font-medium text-[#C75B39]">
          {priceLabel}
        </p>
      </div>
    </Link>
  );
}

export function RecommendationRail({
  title,
  subtitle,
  items,
  context,
  className,
}: {
  title: string;
  subtitle?: string;
  items: RecommendationItem[];
  context: string;
  className?: string;
}) {
  const reduceMotion = useReducedMotion();
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (!items.length) return;
    void recommendationService.trackEvents(
      items.map((item, rank) => ({
        context,
        action: "impression",
        kind: item.kind,
        id: item.id,
        rank,
      })),
    );
    track({
      name:
        context === "post_purchase"
          ? "recommendation.post_purchase_shown"
          : "recommendation.shown",
      properties: {
        context,
        ids: items.map((i) => `${i.kind}:${i.id}`),
      },
    });
  }, [items, context]);

  const scrollToIndex = (index: number) => {
    const el = scrollerRef.current;
    const card = el?.children[index] as HTMLElement | undefined;
    if (!el || !card) return;
    el.scrollTo({
      left: card.offsetLeft - 4,
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
      const left = el.scrollLeft + 24;
      let nearest = 0;
      let nearestDist = Infinity;
      cards.forEach((card, i) => {
        const dist = Math.abs(card.offsetLeft - left);
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
          // Loop: jump without animation when wrapping to start after last card
          if (next === 0) {
            el.scrollTo({
              left: 0,
              behavior: reduceMotion ? "auto" : "smooth",
            });
          } else {
            el.scrollTo({
              left: card.offsetLeft - 4,
              behavior: "smooth",
            });
          }
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

  if (!items.length) return null;

  return (
    <section
      className={cn("space-y-5", className)}
      aria-roledescription="carousel"
      aria-label={title}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
          setPaused(false);
        }
      }}
    >
      <div className="flex items-end justify-between gap-4">
        {title || subtitle ? (
          <div className="min-w-0">
            {title ? (
              <h2 className="font-display text-2xl text-[#3A2A25] md:text-3xl">
                {title}
              </h2>
            ) : null}
            {subtitle ? (
              <p className="mt-1.5 max-w-xl text-sm text-[#7A6258]">
                {subtitle}
              </p>
            ) : null}
          </div>
        ) : (
          <div className="min-w-0" />
        )}
        {items.length > 1 ? (
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              aria-label="Previous"
              onClick={() => go(-1)}
              className="flex size-9 items-center justify-center rounded-full border border-[#F4DDD0] bg-white text-[#3A2A25] transition-colors hover:border-[#E3A78C]"
            >
              <ArrowLeft className="size-3.5" />
            </button>
            <button
              type="button"
              aria-label="Next"
              onClick={() => go(1)}
              className="flex size-9 items-center justify-center rounded-full border border-[#F4DDD0] bg-white text-[#3A2A25] transition-colors hover:border-[#E3A78C]"
            >
              <ArrowRight className="size-3.5" />
            </button>
          </div>
        ) : null}
      </div>

      <div
        ref={scrollerRef}
        className="scrollbar-hide -mx-1 flex snap-x snap-mandatory gap-4 overflow-x-auto px-1 pb-1"
      >
        {items.map((item, rank) => (
          <div
            key={`${item.kind}:${item.id}`}
            className="w-[min(72vw,16.5rem)] shrink-0 snap-start sm:w-[17.5rem]"
            aria-roledescription="slide"
            aria-label={`${rank + 1} of ${items.length}`}
          >
            <RecommendationCard
              item={item}
              rank={rank}
              context={context}
              className="h-full"
            />
          </div>
        ))}
      </div>

      {items.length > 1 ? (
        <div
          className="flex items-center justify-center gap-1.5"
          role="tablist"
          aria-label="Carousel pages"
        >
          {items.map((item, i) => (
            <button
              key={`${item.kind}:${item.id}:dot`}
              type="button"
              role="tab"
              aria-selected={i === active}
              aria-label={`Go to item ${i + 1}`}
              onClick={() => scrollToIndex(i)}
              className={cn(
                "h-1.5 rounded-full transition-all duration-300",
                i === active
                  ? "w-5 bg-[#3A2A25]"
                  : "w-1.5 bg-[#E8D0C4] hover:bg-[#D4B8AA]",
              )}
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}
