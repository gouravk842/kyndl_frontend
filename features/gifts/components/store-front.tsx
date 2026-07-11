"use client";

import { Store } from "lucide-react";

import { GiftCard } from "@/features/gifts/components/gift-card";
import type { PublicStore } from "@/types/gift";

export function StoreFront({ store }: { store: PublicStore }) {
  return (
    <div>
      {/* Shop header */}
      <div className="flex items-center gap-4">
        <span className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-[#FFF1E9] to-[#FCE3DC] text-[#C75B39]">
          {store.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={store.logo_url} alt="" className="size-full object-cover" />
          ) : (
            <Store className="size-7" />
          )}
        </span>
        <div>
          <h1 className="font-display text-3xl text-[#3A2A25] md:text-4xl">{store.name}</h1>
          {store.description && (
            <p className="mt-1 max-w-2xl text-[#7A6258]">{store.description}</p>
          )}
        </div>
      </div>

      {/* Products */}
      <div className="mt-10">
        {store.products.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-[#F2DACE] bg-white/60 py-20 text-center">
            <Store className="mx-auto size-10 text-[#E3A78C]" />
            <p className="mt-4 font-display text-xl text-[#3A2A25]">No gifts listed yet</p>
            <p className="mt-2 text-sm text-[#7A6258]">This shop is just getting started.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {store.products.map((product, i) => (
              <GiftCard key={product.slug} product={product} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
