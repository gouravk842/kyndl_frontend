"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Check, Gift, Minus, Plus, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { PageContainer } from "@/components/layout/page-container";
import { ROUTES } from "@/constants/routes";
import { ProductImageZoom } from "@/features/gifts/components/product-image-zoom";
import { WishlistButton } from "@/features/gifts/components/wishlist-button";
import { RelatedPairings } from "@/features/recommendations/components/companion-recommendations";
import { ReferProductButton } from "@/features/referrals/components/refer-product-button";
import { RatingBadge } from "@/features/reviews/components/rating-summary";
import { ReviewsSection } from "@/features/reviews/components/reviews-section";
import { formatPrice } from "@/lib/gifts";
import { cn } from "@/lib/utils";
import { track } from "@/services/analytics/analytics.service";
import { useCartStore } from "@/store/cart.store";
import type { GiftProduct } from "@/types/gift";

export function ProductDetail({ product }: { product: GiftProduct }) {
  const router = useRouter();
  const add = useCartStore((s) => s.add);
  const setOpen = useCartStore((s) => s.setOpen);

  useEffect(() => {
    track({
      name: "product.viewed",
      properties: { kind: "physical", id: product.slug },
    });
  }, [product.slug]);

  const images = (
    product.gallery?.length ? product.gallery : [product.image_url]
  ).filter(Boolean);
  const [activeIdx, setActiveIdx] = useState(0);
  const [qty, setQty] = useState(1);
  const activeImg = images[activeIdx] ?? "";
  const cap = Math.max(product.stock, 1);

  const buyNow = () => {
    add(product, qty);
    setOpen(false);
    router.push(ROUTES.checkout);
  };

  return (
    <div className="relative">
      {/* Atmospheric wash — keeps the spotlight light, not a dark studio */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[min(72vh,640px)]"
        style={{
          background:
            "radial-gradient(ellipse 80% 70% at 50% -10%, rgba(255,180,150,0.28) 0%, transparent 55%), linear-gradient(180deg, #FCE8DE 0%, #FFF7F1 58%, #FFF7F1 100%)",
        }}
        aria-hidden
      />

      <PageContainer
        size="xl"
        className={cn(
          "relative pt-3 md:pt-5",
          product.in_stock ? "pb-28 lg:pb-14" : "pb-10",
        )}
      >
        <div className="flex items-center justify-between gap-3">
          <Link
            href={ROUTES.gifts}
            className="inline-flex items-center gap-1.5 text-sm text-[#7A6258] transition-colors hover:text-[#3A2A25]"
          >
            <ArrowLeft className="size-3.5" />
            Gifts
          </Link>
          {(product.subcategory || product.category) && (
            <span className="text-[11px] font-medium tracking-[0.16em] text-[#C75B39] uppercase">
              {product.subcategory || product.category}
            </span>
          )}
        </div>

        {/* ── Spotlight ─────────────────────────────────────────── */}
        <div className="mt-5 grid items-start gap-8 lg:mt-8 lg:grid-cols-2 lg:gap-12 xl:gap-16">
          {/* Museum-matte image + Flipkart-style zoom */}
          <motion.div
            className="relative z-20 mx-auto w-full max-w-lg lg:max-w-none"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="relative">
              <div
                className="pointer-events-none absolute left-1/2 top-1/2 aspect-square w-[88%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#FFC4B0]/35 blur-3xl"
                aria-hidden
              />

              <div className="relative rounded-[2rem] bg-white/70 p-3 shadow-[0_30px_80px_-40px_rgba(90,50,40,0.35)] ring-1 ring-[#F0DAC9]/80 backdrop-blur-sm sm:p-4">
                {activeImg ? (
                  <ProductImageZoom
                    key={activeImg}
                    src={activeImg}
                    alt={product.name}
                  />
                ) : (
                  <div className="relative aspect-square overflow-hidden rounded-[1.35rem] bg-[#F8EBE4]">
                    <span className="flex size-full items-center justify-center text-[#E3A78C]">
                      <Gift className="size-14" />
                    </span>
                  </div>
                )}
              </div>

              <div className="absolute -right-1 -top-1 z-30 sm:right-1 sm:top-1">
                <WishlistButton
                  slug={product.slug}
                  size="sm"
                  className="border border-[#F2DACE] bg-white shadow-sm"
                />
              </div>
            </div>

            {images.length > 1 && (
              <div className="mt-4 flex justify-center gap-2">
                {images.map((src, i) => (
                  <button
                    key={src}
                    type="button"
                    onClick={() => setActiveIdx(i)}
                    aria-label={`Photo ${i + 1}`}
                    className={cn(
                      "overflow-hidden rounded-xl border-2 transition-all duration-300",
                      activeIdx === i
                        ? "size-14 border-[#3A2A25]"
                        : "size-12 border-transparent opacity-65 hover:opacity-100",
                    )}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt="" className="size-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Open buy column — no card chrome */}
          <motion.div
            className="flex flex-col lg:max-w-md"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            {product.tagline && (
              <p className="font-hand text-xl leading-snug text-[#C75B39] sm:text-2xl">
                {product.tagline}
              </p>
            )}

            <h1 className="mt-2 font-display text-3xl leading-[1.1] tracking-tight text-[#3A2A25] sm:text-4xl lg:text-[2.75rem]">
              {product.name}
            </h1>

            {product.vendor_slug && product.vendor_name && (
              <Link
                href={`${ROUTES.storefront}/${product.vendor_slug}`}
                className="mt-2 w-fit text-sm text-[#B08C7D] transition-colors hover:text-[#C75B39]"
              >
                by {product.vendor_name}
              </Link>
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

            <div className="mt-6 flex items-baseline gap-3">
              <span className="font-display text-3xl tabular-nums text-[#3A2A25]">
                {formatPrice(product.price, product.currency)}
              </span>
              {product.in_stock ? (
                <span className="inline-flex items-center gap-1 text-sm text-[#2a9a5c]">
                  <Check className="size-3.5" />
                  In stock
                  {product.stock <= 5 && (
                    <span className="text-[#8A7168]">
                      · {product.stock} left
                    </span>
                  )}
                </span>
              ) : (
                <span className="text-sm text-[#C81D4E]">Sold out</span>
              )}
            </div>

            {product.in_stock && (
              <div className="mt-7 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="inline-flex items-center rounded-full bg-white/80 ring-1 ring-[#F2DACE]">
                    <button
                      type="button"
                      onClick={() => setQty((q) => Math.max(1, q - 1))}
                      aria-label="Decrease quantity"
                      className="flex size-10 items-center justify-center text-[#7A6258] hover:text-[#3A2A25]"
                    >
                      <Minus className="size-3.5" />
                    </button>
                    <span className="w-8 text-center text-sm tabular-nums text-[#3A2A25]">
                      {qty}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQty((q) => Math.min(cap, q + 1))}
                      disabled={qty >= cap}
                      aria-label="Increase quantity"
                      className="flex size-10 items-center justify-center text-[#7A6258] hover:text-[#3A2A25] disabled:opacity-30"
                    >
                      <Plus className="size-3.5" />
                    </button>
                  </div>
                  <span className="text-xs text-[#8A7168]">Quantity</span>
                </div>

                <button
                  type="button"
                  onClick={buyNow}
                  className="inline-flex h-12 w-full items-center justify-center rounded-full bg-[#3A2A25] text-sm font-semibold text-white transition-transform duration-300 hover:-translate-y-0.5 hover:bg-[#4A3832]"
                >
                  Send this gift
                </button>
                <button
                  type="button"
                  onClick={() => add(product, qty)}
                  className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full text-sm font-medium text-[#C75B39] transition-colors hover:bg-white/60"
                >
                  <ShoppingBag className="size-4" />
                  Or add to bag
                </button>
                <ReferProductButton
                  kind="gift"
                  slug={product.slug}
                  className="h-11 w-full rounded-full px-4 text-sm"
                />
              </div>
            )}

            <p className="mt-6 text-xs leading-relaxed text-[#8A7168]">
              Free shipping over ₹999 · Arrives ready to unwrap
            </p>
          </motion.div>
        </div>

        {/* ── Story ─────────────────────────────────────────────── */}
        {product.description && (
          <motion.section
            className="mx-auto mt-14 max-w-xl border-t border-[#F2DACE]/80 pt-10 md:mt-20"
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.45 }}
          >
            <h2 className="text-center font-display text-xl text-[#3A2A25]">
              About this piece
            </h2>
            <p className="mt-4 whitespace-pre-line text-center text-[15px] leading-[1.75] text-[#6B554C]">
              {product.description}
            </p>
          </motion.section>
        )}

        <div
          id="reviews"
          className="mt-12 max-w-3xl scroll-mt-24 border-t border-[#F2DACE]/70 pt-8 md:mt-16"
        >
          <ReviewsSection type="product" refId={product.slug} />
        </div>

        <RelatedPairings
          kind="physical"
          id={product.slug}
          title="Goes with it"
        />
      </PageContainer>

      {product.in_stock && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[#F2DACE]/80 bg-[#FFF7F1]/95 px-4 py-3 backdrop-blur-lg lg:hidden">
          <div className="mx-auto flex max-w-lg items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-[#3A2A25]">
                {product.name}
              </p>
              <p className="text-sm tabular-nums text-[#7A6258]">
                {formatPrice(product.price, product.currency)}
              </p>
            </div>
            <button
              type="button"
              onClick={buyNow}
              className="inline-flex h-11 shrink-0 items-center rounded-full bg-[#3A2A25] px-5 text-sm font-semibold text-white"
            >
              Send this
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
