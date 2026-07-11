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
