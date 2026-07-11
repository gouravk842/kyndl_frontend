import type { ExperiencePrice as Price } from "@/lib/server/experiences";
import { formatPrice } from "@/lib/gifts";
import { cn } from "@/lib/utils";

/**
 * Renders an experience's price with launch-offer treatment: the current price,
 * a struck-through anchor ("was") price, a percentage-off chip, and — in the
 * `full` variant — the offer label and how much the buyer saves.
 *
 * Purely presentational (props only), so it drops into both server pages and
 * client cards. Renders nothing when the backend supplied no price.
 *
 *   - `tag`  — compact, for experience cards (₹299 ~₹499~ −40%)
 *   - `full` — prominent, for product-page hero near the CTA
 */
interface ExperiencePriceProps {
  price: Price | null;
  variant?: "tag" | "full";
  className?: string;
}

export function ExperiencePrice({
  price,
  variant = "tag",
  className,
}: ExperiencePriceProps) {
  if (!price) return null;

  // Free experiences get a quiet, positive label — no offer scaffolding.
  if (price.isFree) {
    return (
      <span
        className={cn(
          "inline-flex items-center text-sm font-semibold text-[#2FB672]",
          variant === "full" && "text-base",
          className,
        )}
      >
        Free
      </span>
    );
  }

  const amount = formatPrice(price.amount, price.currency);
  const compareAt =
    price.hasOffer && price.compareAtAmount !== null
      ? formatPrice(price.compareAtAmount, price.currency)
      : null;

  if (variant === "tag") {
    return (
      <span className={cn("inline-flex items-baseline gap-1.5", className)}>
        <span className="text-base font-semibold text-[#3A2A25]">{amount}</span>
        {compareAt && (
          <>
            <span className="text-xs text-[#B08C7D] line-through">
              {compareAt}
            </span>
            <span className="rounded-full bg-gradient-to-r from-[#FF7A59] to-[#F2596F] px-1.5 py-0.5 text-[10px] font-bold leading-none text-white">
              −{price.discountPercent}%
            </span>
          </>
        )}
      </span>
    );
  }

  // full
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="flex flex-wrap items-baseline gap-2.5">
        <span className="font-display text-3xl text-[#3A2A25]">{amount}</span>
        {compareAt && (
          <span className="text-lg text-[#B08C7D] line-through">{compareAt}</span>
        )}
        {price.hasOffer && (
          <span className="rounded-full bg-gradient-to-r from-[#FF7A59] to-[#F2596F] px-2.5 py-1 text-xs font-semibold tracking-wide text-white uppercase">
            {price.discountPercent}% off
          </span>
        )}
      </div>
      {price.hasOffer && (
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-sm">
          {price.offerLabel && (
            <span className="inline-flex items-center rounded-full border border-[#F2DACE] bg-white/70 px-2.5 py-0.5 text-xs font-medium text-[#C75B39]">
              {price.offerLabel}
            </span>
          )}
          <span className="text-[#7A6258]">
            You save {formatPrice(price.savingsAmount, price.currency)}
          </span>
        </div>
      )}
    </div>
  );
}
