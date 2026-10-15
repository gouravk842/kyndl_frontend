"use client";

import { motion } from "framer-motion";
import {
  Gem,
  Gift,
  Heart,
  Home,
  type LucideIcon,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

import { FadeIn } from "@/components/animations/fade-in";
import { PageContainer } from "@/components/layout/page-container";
import { ROUTES } from "@/constants/routes";
import type { ProductCategory } from "@/types/gift";

const ease = [0.22, 1, 0.36, 1] as const;

/** Curated shelves when the taxonomy is still empty — still link into /gifts. */
const FALLBACK_SHELVES: {
  name: string;
  slug: string;
  blurb: string;
  icon: LucideIcon;
}[] = [
  {
    name: "Jewellery",
    slug: "jewellery",
    blurb: "Rings, chains, and pieces that catch the light.",
    icon: Gem,
  },
  {
    name: "Personalized",
    slug: "personalized",
    blurb: "Names, dates, and details only they would notice.",
    icon: Sparkles,
  },
  {
    name: "Keepsakes",
    slug: "keepsakes",
    blurb: "Objects meant to stay on a shelf — and in a story.",
    icon: Gift,
  },
  {
    name: "For the home",
    slug: "home",
    blurb: "Warmth for the places you share.",
    icon: Home,
  },
  {
    name: "Just because",
    slug: "just-because",
    blurb: "No occasion required — only intention.",
    icon: Heart,
  },
];

const ICONS: LucideIcon[] = [Gem, Sparkles, Gift, Home, Heart];

function iconFor(index: number, slug: string): LucideIcon {
  const lower = slug.toLowerCase();
  if (lower.includes("jewel") || lower.includes("ring")) return Gem;
  if (lower.includes("home") || lower.includes("decor")) return Home;
  if (lower.includes("personal") || lower.includes("custom")) return Sparkles;
  if (lower.includes("heart") || lower.includes("love")) return Heart;
  return ICONS[index % ICONS.length] ?? Gift;
}

export function ShopCategories({
  categories,
}: {
  categories: ProductCategory[];
}) {
  const fromApi = categories.length > 0;
  const shelves = fromApi
    ? categories.slice(0, 6).map((c, i) => ({
        name: c.name,
        slug: c.slug,
        blurb:
          c.subcategories.length > 0
            ? c.subcategories
                .slice(0, 3)
                .map((s) => s.name)
                .join(" · ")
            : "Browse this shelf",
        icon: iconFor(i, c.slug),
        href: `${ROUTES.gifts}?category=${encodeURIComponent(c.slug)}`,
      }))
    : FALLBACK_SHELVES.map((s) => ({
        ...s,
        // No taxonomy yet — open the full shop rather than an empty filter.
        href: ROUTES.gifts,
      }));

  return (
    <section className="relative border-b border-[#F2DACE] bg-[#FFF7F1] py-16 md:py-20">
      <PageContainer size="xl">
        <FadeIn>
          <p className="text-sm font-medium tracking-[0.2em] text-[#C75B39] uppercase">
            Shop by shelf
          </p>
          <h2 className="mt-3 font-display text-3xl text-[#3A2A25] md:text-4xl">
            Jewellery, gifts, and more.
          </h2>
          <p className="mt-3 max-w-xl text-[#7A6258]">
            Start with a shelf — or wander the full shop.
          </p>
        </FadeIn>

        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {shelves.map((shelf, index) => {
            const Icon = shelf.icon;
            return (
              <motion.li
                key={shelf.slug}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ delay: index * 0.06, duration: 0.45, ease }}
              >
                <Link
                  href={shelf.href}
                  className="group flex h-full flex-col border-b border-[#F2DACE] pb-5 transition-colors hover:border-[#C75B39]/50"
                >
                  <Icon className="size-5 text-[#C75B39] transition-transform duration-300 group-hover:-translate-y-0.5" />
                  <span className="mt-4 font-display text-xl text-[#3A2A25] group-hover:text-[#C75B39]">
                    {shelf.name}
                  </span>
                  <span className="mt-1.5 text-sm leading-relaxed text-[#92786C]">
                    {shelf.blurb}
                  </span>
                </Link>
              </motion.li>
            );
          })}
        </ul>
      </PageContainer>
    </section>
  );
}
