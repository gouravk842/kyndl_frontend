"use client";

import { Gift, Loader2, Search } from "lucide-react";
import { useMemo, useState } from "react";

import { GiftCard } from "@/features/gifts/components/gift-card";
import { useGiftCatalog } from "@/hooks/use-gifts";
import { cn } from "@/lib/utils";
import type { CatalogSort, GiftProduct } from "@/types/gift";

const ALL = "All";

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
  const [category, setCategory] = useState(ALL);

  // Category chips are derived from the SSR list so they're stable while typing.
  const categories = useMemo(() => {
    const set = new Set<string>();
    initial.forEach((p) => p.category && set.add(p.category));
    return [ALL, ...Array.from(set).sort()];
  }, [initial]);

  const params = {
    q: q.trim() || undefined,
    sort,
    category: category === ALL ? undefined : category,
  };
  const isDefault = !params.q && sort === "newest" && category === ALL;

  const { data, isFetching } = useGiftCatalog(params);
  // Use the server-rendered list until the first client fetch resolves.
  const products = isDefault && !data ? initial : (data ?? []);

  return (
    <div>
      {/* Controls */}
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="relative w-full md:max-w-xs">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#B08C7D]" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search gifts…"
            className="h-11 w-full rounded-full border border-[#F2DACE] bg-white/80 pl-10 pr-4 text-sm text-[#3A2A25] outline-none placeholder:text-[#B08C7D] focus:border-[#FF7A59]/50"
          />
        </div>
        <div className="flex items-center gap-2">
          {isFetching && <Loader2 className="size-4 animate-spin text-[#C75B39]" />}
          <label className="sr-only" htmlFor="gift-sort">
            Sort
          </label>
          <select
            id="gift-sort"
            value={sort}
            onChange={(e) => setSort(e.target.value as CatalogSort)}
            className="h-11 rounded-full border border-[#F2DACE] bg-white/80 px-4 text-sm text-[#3A2A25] outline-none focus:border-[#FF7A59]/50"
          >
            {SORTS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {categories.length > 2 && (
        <div className="mb-8 flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={cn(
                "rounded-full border px-4 py-1.5 text-sm transition-all duration-300",
                category === cat
                  ? "border-transparent bg-gradient-to-r from-[#FF7A59] to-[#F2596F] text-white"
                  : "border-[#F2DACE] bg-white/70 text-[#7A6258] hover:border-[#FF7A59]/50 hover:text-[#3A2A25]",
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {products.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-[#F2DACE] bg-white/60 py-20 text-center">
          <Gift className="mx-auto size-10 text-[#E3A78C]" />
          <p className="mt-4 font-display text-xl text-[#3A2A25]">
            {params.q ? `Nothing matches “${params.q}”` : "The shelves are being restocked"}
          </p>
          <p className="mt-2 text-sm text-[#7A6258]">
            {params.q ? "Try a different search." : "New little treasures are on their way."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product, i) => (
            <GiftCard key={product.slug} product={product} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
