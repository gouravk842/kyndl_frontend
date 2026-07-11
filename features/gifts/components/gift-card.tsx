"use client";

import { motion } from "framer-motion";
import { Gift, Plus } from "lucide-react";
import Link from "next/link";

import { ROUTES } from "@/constants/routes";
import { WishlistButton } from "@/features/gifts/components/wishlist-button";
import { formatPrice } from "@/lib/gifts";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/store/cart.store";
import type { GiftProduct } from "@/types/gift";

export function GiftCard({
  product,
  index = 0,
}: {
  product: GiftProduct;
  index?: number;
}) {
  const add = useCartStore((s) => s.add);
  const href = `${ROUTES.gifts}/${product.slug}`;

  return (
    <motion.article
      className={cn(
        "kyndl-card-soft group relative flex flex-col overflow-hidden rounded-3xl border border-[#F4DDD0] bg-white",
        "transition-all duration-500 hover:-translate-y-1 hover:border-[#FF7A59]/45",
      )}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-64px" }}
      transition={{ delay: index * 0.06, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
    >
      <WishlistButton slug={product.slug} className="absolute right-3 top-3 z-10" size="sm" />
      <Link href={href} className="relative block aspect-square overflow-hidden bg-[#FDEBE6]">
        {product.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.image_url}
            alt={product.name}
            className="size-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <span className="flex size-full items-center justify-center bg-gradient-to-br from-[#FFF1E9] to-[#FCE3DC] text-[#E3A78C]">
            <Gift className="size-12" />
          </span>
        )}
        {product.is_featured && (
          <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-[11px] font-medium tracking-wider text-[#C75B39] uppercase backdrop-blur-sm">
            Loved
          </span>
        )}
        {!product.in_stock && (
          <span className="absolute inset-0 flex items-center justify-center bg-white/60 text-sm font-medium text-[#7A6258] backdrop-blur-[1px]">
            Sold out
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <Link href={href}>
          <h3 className="font-display text-lg leading-tight text-[#3A2A25] transition-colors group-hover:text-[#C75B39]">
            {product.name}
          </h3>
        </Link>
        {product.vendor_slug && product.vendor_name && (
          <Link
            href={`${ROUTES.storefront}/${product.vendor_slug}`}
            className="mt-0.5 w-fit text-xs text-[#B08C7D] transition-colors hover:text-[#C75B39]"
          >
            by {product.vendor_name}
          </Link>
        )}
        {product.tagline && (
          <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-[#7A6258]">
            {product.tagline}
          </p>
        )}
        <div className="mt-4 flex items-center justify-between gap-3 pt-1">
          <span className="font-display text-lg text-[#3A2A25]">
            {formatPrice(product.price, product.currency)}
          </span>
          <button
            type="button"
            disabled={!product.in_stock}
            onClick={() => add(product)}
            aria-label={`Add ${product.name} to cart`}
            className={cn(
              "inline-flex size-10 items-center justify-center rounded-full text-white transition-all duration-300",
              "bg-gradient-to-br from-[#FF7A59] to-[#F2596F] kyndl-glow-warm hover:-translate-y-0.5",
              "disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0",
            )}
          >
            <Plus className="size-5" />
          </button>
        </div>
      </div>
    </motion.article>
  );
}
