"use client";

import { motion } from "framer-motion";
import Link from "next/link";

import { FadeIn } from "@/components/animations/fade-in";
import { PageContainer } from "@/components/layout/page-container";
import { ROUTES } from "@/constants/routes";

const ease = [0.22, 1, 0.36, 1] as const;

const OCCASIONS = [
  { label: "Anniversary", q: "anniversary" },
  { label: "Birthday", q: "birthday" },
  { label: "Just because", q: "gift" },
  { label: "Proposal", q: "proposal" },
  { label: "Long distance", q: "keepsake" },
] as const;

export function ShopOccasions() {
  return (
    <section className="border-y border-[#EFE4DA] bg-[#F7EFE8] py-14 md:py-16">
      <PageContainer size="xl">
        <FadeIn>
          <h2 className="text-center font-display text-2xl tracking-tight text-[#2A1814] md:text-3xl">
            Shop by occasion
          </h2>
        </FadeIn>
        <ul className="mt-8 flex flex-wrap items-center justify-center gap-2.5 sm:gap-3">
          {OCCASIONS.map((item, index) => (
            <motion.li
              key={item.label}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.04, duration: 0.4, ease }}
            >
              <Link
                href={`${ROUTES.gifts}?q=${encodeURIComponent(item.q)}`}
                className="inline-flex h-11 items-center border border-[#2A1814]/15 bg-white/70 px-5 text-sm font-medium text-[#2A1814] transition-colors hover:border-[#2A1814]/40 hover:bg-white"
              >
                {item.label}
              </Link>
            </motion.li>
          ))}
        </ul>
      </PageContainer>
    </section>
  );
}
