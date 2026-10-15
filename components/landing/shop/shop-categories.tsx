"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

import { FadeIn } from "@/components/animations/fade-in";
import { PageContainer } from "@/components/layout/page-container";
import { ROUTES } from "@/constants/routes";
import type { ProductCategory } from "@/types/gift";

const ease = [0.22, 1, 0.36, 1] as const;

const FALLBACK_SHELVES: {
  name: string;
  slug: string;
  image: string;
  href: string;
}[] = [
  {
    name: "Jewellery",
    slug: "jewellery",
    image: "/images/shop-cat-jewellery.jpg",
    href: ROUTES.gifts,
  },
  {
    name: "Personalized",
    slug: "personalized",
    image: "/images/shop-cat-personalized.jpg",
    href: ROUTES.gifts,
  },
  {
    name: "Keepsakes",
    slug: "keepsakes",
    image: "/images/shop-cat-keepsakes.jpg",
    href: ROUTES.gifts,
  },
  {
    name: "For the home",
    slug: "home",
    image: "/images/shop-cat-home.jpg",
    href: ROUTES.gifts,
  },
  {
    name: "Just because",
    slug: "just-because",
    image: "/images/shop-cat-just-because.jpg",
    href: ROUTES.gifts,
  },
];

const IMAGE_BY_HINT: { match: RegExp; image: string }[] = [
  {
    match: /jewel|ring|neck|earring|gold/i,
    image: "/images/shop-cat-jewellery.jpg",
  },
  {
    match: /personal|custom|engrav/i,
    image: "/images/shop-cat-personalized.jpg",
  },
  { match: /keep|memory|moment/i, image: "/images/shop-cat-keepsakes.jpg" },
  { match: /home|decor|living/i, image: "/images/shop-cat-home.jpg" },
];

function imageFor(slug: string, name: string, index: number): string {
  const hay = `${slug} ${name}`;
  for (const row of IMAGE_BY_HINT) {
    if (row.match.test(hay)) return row.image;
  }
  return FALLBACK_SHELVES[index % FALLBACK_SHELVES.length]!.image;
}

export function ShopCategories({
  categories,
}: {
  categories: ProductCategory[];
}) {
  const shelves =
    categories.length > 0
      ? categories.slice(0, 5).map((c, i) => ({
          name: c.name,
          slug: c.slug,
          image: imageFor(c.slug, c.name, i),
          href: `${ROUTES.gifts}?category=${encodeURIComponent(c.slug)}`,
        }))
      : FALLBACK_SHELVES;

  return (
    <section className="bg-[#FFFAF6] py-16 md:py-20">
      <PageContainer size="xl">
        <FadeIn>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="font-display text-3xl tracking-tight text-[#2A1814] md:text-[2.35rem]">
                Shop the collection
              </h2>
              <p className="mt-2 max-w-md text-[#7A6258]">
                Start with a shelf that fits the moment.
              </p>
            </div>
            <Link
              href={ROUTES.gifts}
              className="text-sm font-medium text-[#2A1814] underline-offset-4 hover:underline"
            >
              View all
            </Link>
          </div>
        </FadeIn>

        <ul className="mt-10 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-5">
          {shelves.map((shelf, index) => (
            <motion.li
              key={shelf.slug}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ delay: index * 0.05, duration: 0.5, ease }}
            >
              <Link href={shelf.href} className="group block">
                <div className="relative aspect-[4/5] overflow-hidden bg-[#EDE0D6]">
                  <Image
                    src={shelf.image}
                    alt=""
                    fill
                    sizes="(max-width: 768px) 50vw, 20vw"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                  />
                  <div
                    className="absolute inset-0 bg-gradient-to-t from-[#2A1814]/55 via-transparent to-transparent"
                    aria-hidden
                  />
                  <span className="absolute inset-x-0 bottom-0 p-3 font-display text-lg text-[#FFFAF6] sm:p-4 sm:text-xl">
                    {shelf.name}
                  </span>
                </div>
              </Link>
            </motion.li>
          ))}
        </ul>
      </PageContainer>
    </section>
  );
}
