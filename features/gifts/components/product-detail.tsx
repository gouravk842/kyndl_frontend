"use client";

import { ArrowLeft, Check, Gift, Minus, Plus, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { PageContainer } from "@/components/layout/page-container";
import { ROUTES } from "@/constants/routes";
import { WishlistButton } from "@/features/gifts/components/wishlist-button";
import { RatingBadge } from "@/features/reviews/components/rating-summary";
import { ReviewsSection } from "@/features/reviews/components/reviews-section";
import { formatPrice } from "@/lib/gifts";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/store/cart.store";
import type { GiftProduct } from "@/types/gift";

export function ProductDetail({ product }: { product: GiftProduct }) {
  const router = useRouter();
  const add = useCartStore((s) => s.add);
  const setOpen = useCartStore((s) => s.setOpen);

  const images = [product.image_url, ...product.gallery].filter(Boolean);
  const [activeImg, setActiveImg] = useState(images[0] ?? "");
  const [qty, setQty] = useState(1);

  const cap = Math.max(product.stock, 1);

  const buyNow = () => {
    add(product, qty);
    setOpen(false);
    router.push(ROUTES.checkout);
  };

  return (
    <PageContainer size="xl" className="py-10 md:py-14">
      <Link
        href={ROUTES.gifts}
        className="inline-flex items-center gap-1.5 text-sm text-[#7A6258] transition-colors hover:text-[#3A2A25]"
      >
        <ArrowLeft className="size-4" /> All gifts
      </Link>

      <div className="mt-6 grid gap-10 lg:grid-cols-2">
        {/* ── Gallery ───────────────────────────────────────────── */}
        <div>
          <div className="relative aspect-square overflow-hidden rounded-3xl border border-[#F4DDD0] bg-[#FDEBE6]">
            {activeImg ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={activeImg} alt={product.name} className="size-full object-cover" />
            ) : (
              <span className="flex size-full items-center justify-center bg-gradient-to-br from-[#FFF1E9] to-[#FCE3DC] text-[#E3A78C]">
                <Gift className="size-16" />
              </span>
            )}
          </div>
          {images.length > 1 && (
            <div className="mt-4 flex flex-wrap gap-3">
              {images.map((src) => (
                <button
                  key={src}
                  type="button"
                  onClick={() => setActiveImg(src)}
                  className={cn(
                    "size-16 overflow-hidden rounded-xl border-2 transition-colors",
                    activeImg === src ? "border-[#FF7A59]" : "border-transparent opacity-70",
                  )}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt="" className="size-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Detail ────────────────────────────────────────────── */}
        <div className="flex flex-col">
          {product.category && (
            <span className="text-sm font-medium tracking-[0.16em] text-[#C75B39] uppercase">
              {product.category}
            </span>
          )}
          <div className="mt-2 flex items-start justify-between gap-4">
            <h1 className="font-display text-3xl leading-tight text-[#3A2A25] md:text-4xl">
              {product.name}
            </h1>
            <WishlistButton slug={product.slug} className="shrink-0 border border-[#F4DDD0]" />
          </div>
          {product.vendor_slug && product.vendor_name && (
            <Link
              href={`${ROUTES.storefront}/${product.vendor_slug}`}
              className="mt-1 w-fit text-sm text-[#B08C7D] transition-colors hover:text-[#C75B39]"
            >
              by {product.vendor_name}
            </Link>
          )}
          {product.tagline && (
            <p className="mt-3 text-lg text-[#7A6258]">{product.tagline}</p>
          )}

          {product.rating_count !== undefined && (
            <a href="#reviews" className="mt-3 inline-flex w-fit">
              <RatingBadge
                average={product.rating_average ?? 0}
                count={product.rating_count}
                className="text-[#7A6258]"
              />
            </a>
          )}

          <p className="mt-5 font-display text-3xl text-[#3A2A25]">
            {formatPrice(product.price, product.currency)}
          </p>

          {product.description && (
            <p className="mt-6 whitespace-pre-line leading-relaxed text-[#7A6258]">
              {product.description}
            </p>
          )}

          <div className="mt-4 flex items-center gap-2 text-sm">
            {product.in_stock ? (
              <span className="inline-flex items-center gap-1.5 text-[#2fb672]">
                <Check className="size-4" /> In stock
                {product.stock <= 5 && ` · only ${product.stock} left`}
              </span>
            ) : (
              <span className="text-[#C81D4E]">Currently sold out</span>
            )}
          </div>

          {product.in_stock && (
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <div className="inline-flex items-center rounded-full border border-[#F2DACE] bg-white">
                <button
                  type="button"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  aria-label="Decrease quantity"
                  className="flex size-11 items-center justify-center rounded-full text-[#7A6258] hover:text-[#3A2A25]"
                >
                  <Minus className="size-4" />
                </button>
                <span className="w-8 text-center text-[#3A2A25]">{qty}</span>
                <button
                  type="button"
                  onClick={() => setQty((q) => Math.min(cap, q + 1))}
                  disabled={qty >= cap}
                  aria-label="Increase quantity"
                  className="flex size-11 items-center justify-center rounded-full text-[#7A6258] hover:text-[#3A2A25] disabled:opacity-30"
                >
                  <Plus className="size-4" />
                </button>
              </div>

              <button
                type="button"
                onClick={() => add(product, qty)}
                className="inline-flex h-12 items-center gap-2 rounded-full border border-[#FF7A59]/40 bg-white px-6 text-base font-medium text-[#C75B39] transition-all duration-300 hover:border-[#FF7A59]"
              >
                <ShoppingBag className="size-4" /> Add to bag
              </button>
              <button
                type="button"
                onClick={buyNow}
                className="inline-flex h-12 items-center rounded-full bg-gradient-to-r from-[#FF7A59] to-[#F2596F] px-7 text-base font-medium text-white kyndl-glow-warm transition-all duration-300 hover:-translate-y-0.5"
              >
                Buy it now
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Ratings & reviews ─────────────────────────────────────── */}
      <div id="reviews" className="mt-14 max-w-3xl scroll-mt-24">
        <ReviewsSection type="product" refId={product.slug} />
      </div>
    </PageContainer>
  );
}
