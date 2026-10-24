import type { GiftProduct } from "@/types/gift";

/** Max units a buyer can add per line — matches ``CartItemSerializer``. */
export const MAX_GIFT_QTY = 20;

/** Quantity cap for the public cart/PDP stepper. Hidden inventory uses the
 * checkout max so the remaining count isn't leaked by a disabled + button. */
export function giftQtyCap(
  product: Pick<GiftProduct, "stock" | "in_stock">,
): number {
  if (!product.in_stock) return 1;
  if (product.stock == null) return MAX_GIFT_QTY;
  return Math.max(product.stock, 1);
}

/** Format an integer amount in the smallest currency unit (paise) as a
 * human-readable price, e.g. 49900 → "₹499". */
export function formatPrice(amount: number, currency = "INR"): string {
  const major = amount / 100;
  if (currency === "INR") {
    // No decimals when it's a whole rupee amount — cleaner and more playful.
    const hasPaise = amount % 100 !== 0;
    return `₹${major.toLocaleString("en-IN", {
      minimumFractionDigits: hasPaise ? 2 : 0,
      maximumFractionDigits: 2,
    })}`;
  }
  return `${major.toFixed(2)} ${currency}`;
}
