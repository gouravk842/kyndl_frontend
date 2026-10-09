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
        "group relative flex flex-col overflow-hidden rounded-2xl border border-[#F4DDD0]/80 bg-white",
        "transition-colors duration-300 hover:border-[#FF7A59]/40",
      )}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-48px" }}
      transition={{
        delay: Math.min(index, 8) * 0.04,
        duration: 0.4,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      <WishlistButton
        slug={product.slug}
        className="absolute right-2 top-2 z-10"
        size="sm"
      />
      <Link
        href={href}
        className="relative block aspect-[4/5] overflow-hidden bg-[#FDEBE6]"
      >
        {product.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.image_url}
            alt={product.name}
            className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <span className="flex size-full items-center justify-center bg-gradient-to-br from-[#FFF1E9] to-[#FCE3DC] text-[#E3A78C]">
            <Gift className="size-8" />
          </span>
        )}
        {product.is_featured && (
          <span className="absolute left-2 top-2 rounded-md bg-white/90 px-2 py-0.5 text-[10px] font-medium tracking-wide text-[#C75B39] uppercase backdrop-blur-sm">
            Loved
          </span>
        )}
        {!product.in_stock && (
          <span className="absolute inset-0 flex items-center justify-center bg-white/60 text-xs font-medium text-[#7A6258] backdrop-blur-[1px]">
            Sold out
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-1 p-3 sm:p-3.5">
        <Link href={href} className="min-w-0">
          <h3 className="line-clamp-2 text-sm font-medium leading-snug text-[#3A2A25] transition-colors group-hover:text-[#C75B39]">
            {product.name}
          </h3>
        </Link>
        {product.vendor_slug && product.vendor_name && (
          <Link
            href={`${ROUTES.storefront}/${product.vendor_slug}`}
            className="w-fit truncate text-[11px] text-[#B08C7D] transition-colors hover:text-[#C75B39]"
          >
            by {product.vendor_name}
          </Link>
        )}
        <div className="mt-auto flex items-center justify-between gap-2 pt-2">
          <span className="text-sm font-semibold tabular-nums text-[#3A2A25]">
            {formatPrice(product.price, product.currency)}
          </span>
          <button
            type="button"
            disabled={!product.in_stock}
            onClick={() => add(product)}
            aria-label={`Add ${product.name} to cart`}
            className={cn(
              "inline-flex size-8 shrink-0 items-center justify-center rounded-full text-white transition-opacity duration-200",
              "bg-gradient-to-br from-[#FF7A59] to-[#F2596F] hover:opacity-90",
              "disabled:cursor-not-allowed disabled:opacity-40",
            )}
          >
            <Plus className="size-4" />
          </button>
        </div>
      </div>
    </motion.article>
  );
}
