import { formatInUserTz } from "@/lib/datetime";

/** Date stamp in the viewer's local timezone (UTC from the API). */
export function formatDate(
  date: string | Date,
  locale = "en-US",
  options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
  },
): string {
  return formatInUserTz(date, options, locale);
}

export function formatCurrency(
  amount: number,
  currency = "USD",
  locale = "en-US",
): string {
  return new Intl.NumberFormat(locale, { style: "currency", currency }).format(
    amount,
  );
}

export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return `${str.slice(0, maxLength - 3)}...`;
}
