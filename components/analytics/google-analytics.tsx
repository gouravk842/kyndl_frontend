import Script from "next/script";

import { getGaMeasurementId } from "@/lib/analytics/ga";

/**
 * Standard GA4 bootstrap via gtag.js. Renders nothing when the measurement id
 * is unset. `send_page_view: false` so SPA navigations are owned by
 * `PageViewTracker` (avoids double-counting the first load).
 */
export function GoogleAnalytics() {
  const measurementId = getGaMeasurementId();
  if (!measurementId) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${measurementId}', { send_page_view: false });
        `}
      </Script>
    </>
  );
}
