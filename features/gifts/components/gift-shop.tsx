"use client";

import { Loader2, Search } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { GiftCard } from "@/features/gifts/components/gift-card";
import { ideaHref } from "@/features/ideas/idea-href";
import { useCategories, useGiftCatalog } from "@/hooks/use-gifts";
import { cn } from "@/lib/utils";
import type { CatalogSort, GiftProduct } from "@/types/gift";

const SORTS: { label: string; value: CatalogSort }[] = [
  { label: "Newest", value: "newest" },
  { label: "Most loved", value: "popular" },
  { label: "Price: low to high", value: "price" },
  { label: "Price: high to low", value: "-price" },
  { label: "Name", value: "name" },
];

export function GiftShop({ products: initial }: { products: GiftProduct[] }) {
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<CatalogSort>("newest");
  // Master + subcategory selections are the shared taxonomy's slugs (null = all).
  const [category, setCategory] = useState<string | null>(null);
  const [subcategory, setSubcategory] = useState<string | null>(null);

  const { data: categories } = useCategories();
  const activeMaster = categories?.find((c) => c.slug === category);

  const selectCategory = (slug: string | null) => {
    setCategory(slug);
    setSubcategory(null); // a fresh master starts with no subcategory filter
  };

  const params = {
    q: q.trim() || undefined,
    sort,
    category: category ?? undefined,
    subcategory: subcategory ?? undefined,
  };
  const isDefault = !params.q && sort === "newest" && !category && !subcategory;

  const { data, isFetching } = useGiftCatalog(params);
  // Use the server-rendered list until the first client fetch resolves.
  const products = isDefault && !data ? initial : (data ?? []);

  return (
    <div>
      {/* Filter toolbar — docks just under the 64px site header (`top-16`) so
          search/sort/category stay reachable while the grid scrolls. Bleeds to
          the container edges to read as a bar. */}
      <div className="sticky top-16 z-30 mb-4 -mx-4 border-b border-[#F2DACE]/70 bg-[#FFF7F1]/90 px-4 py-2.5 backdrop-blur-xl sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-[9rem] flex-1 sm:max-w-[13rem]">
            <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-[#B08C7D]" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search…"
              className="h-8 w-full rounded-lg border border-[#F2DACE] bg-white pl-8 pr-2.5 text-sm text-[#3A2A25] outline-none placeholder:text-[#B08C7D] focus:border-[#FF7A59]/50"
            />
          </div>

          {categories && categories.length > 0 && (
            <div className="flex min-w-0 flex-[2] flex-wrap items-center gap-1.5">
              <Chip
                label="All"
                active={!category}
                onClick={() => selectCategory(null)}
              />
              {categories.map((cat) => (
                <Chip
                  key={cat.slug}
                  label={cat.name}
                  active={category === cat.slug}
                  onClick={() => selectCategory(cat.slug)}
                />
              ))}
            </div>
          )}

          <div className="ml-auto flex items-center gap-2">
            {isFetching && (
              <Loader2 className="size-3.5 animate-spin text-[#C75B39]" />
            )}
            <label className="sr-only" htmlFor="gift-sort">
              Sort
            </label>
            <select
              id="gift-sort"
              value={sort}
              onChange={(e) => setSort(e.target.value as CatalogSort)}
              className="h-8 rounded-lg border border-[#F2DACE] bg-white px-2.5 text-sm text-[#3A2A25] outline-none focus:border-[#FF7A59]/50"
            >
              {SORTS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {activeMaster && activeMaster.subcategories.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5 border-t border-[#F2DACE]/50 pt-2">
            <Chip
              label={`All ${activeMaster.name}`}
              active={!subcategory}
              onClick={() => setSubcategory(null)}
              small
            />
            {activeMaster.subcategories.map((sub) => (
              <Chip
                key={sub.slug}
                label={sub.name}
                active={subcategory === sub.slug}
                onClick={() => setSubcategory(sub.slug)}
                small
              />
            ))}
          </div>
        )}
      </div>

      {products.length === 0 ? (
        isFetching ? (
          <div className="rounded-3xl border border-dashed border-[#F2DACE] bg-white/60 py-20 text-center">
            <Loader2 className="mx-auto size-6 animate-spin text-[#C75B39]" />
            <p className="mt-4 text-sm text-[#7A6258]">
              Looking through the shelf…
            </p>
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-[#F2DACE] bg-white/60 px-6 py-16 text-center">
            <p className="font-display text-2xl text-[#3A2A25]">
              {params.q
                ? `Nothing matches “${params.q}”.`
                : category
                  ? "Nothing in this corner of the shelf yet."
                  : "Nothing on the shelf fits just yet."}
            </p>
            <p className="mx-auto mt-3 max-w-md text-sm text-[#7A6258]">
              Tell us what you were hoping to unwrap. We&apos;ll try to figure
              it out.
            </p>
            <Link
              href={ideaHref({ source: "gifts", seed: params.q })}
              className="mt-6 inline-flex h-11 items-center justify-center rounded-full bg-gradient-to-r from-[#FF7A59] to-[#F2596F] px-6 text-sm font-medium text-white kyndl-glow-warm transition-all duration-300 hover:-translate-y-0.5"
            >
              Leave the idea
            </Link>
          </div>
        )
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {products.map((product, i) => (
              <GiftCard key={product.slug} product={product} index={i} />
            ))}
          </div>
          <p className="mt-12 text-center text-sm text-[#7A6258]">
            Hoping to unwrap something else?{" "}
            <Link
              href={ideaHref({ source: "gifts" })}
              className="font-semibold text-[#C75B39] hover:text-[#9e3f21]"
            >
              Tell us →
            </Link>
          </p>
        </>
      )}
    </div>
  );
}

function Chip({
  label,
  active,
  onClick,
  small,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  small?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-md border transition-colors",
        small ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs",
        active
          ? "border-[#3A2A25] bg-[#3A2A25] text-white"
          : "border-[#F2DACE] bg-white text-[#7A6258] hover:border-[#E3A78C] hover:text-[#3A2A25]",
      )}
    >
      {label}
    </button>
  );
}
