/**
 * Google Analytics 4 helpers (free). No-ops when `NEXT_PUBLIC_GA_MEASUREMENT_ID`
 * is unset so local/dev builds stay quiet.
 */

export function getGaMeasurementId(): string | undefined {
  const id = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim();
  return id || undefined;
}

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

/** Standard GA4 SPA page view. Safe to call before gtag loads (no-op). */
export function gaPageView(path: string): void {
  const id = getGaMeasurementId();
  if (
    !id ||
    typeof window === "undefined" ||
    typeof window.gtag !== "function"
  ) {
    return;
  }
  window.gtag("event", "page_view", {
    page_path: path,
    page_location: window.location.href,
    page_title: document.title,
    send_to: id,
  });
}
