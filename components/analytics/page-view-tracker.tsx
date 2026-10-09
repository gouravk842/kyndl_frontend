"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

import { gaPageView } from "@/lib/analytics/ga";
import { track } from "@/services/analytics/analytics.service";

/**
 * Fires first-party `page.viewed` + GA4 `page_view` on load and every
 * client-side route change. Mounted once near the root (see `AppProviders`).
 *
 * Guards against double-firing in React Strict Mode / re-renders by remembering
 * the last path it reported.
 */
export function PageViewTracker() {
  const pathname = usePathname();
  const lastTracked = useRef<string | null>(null);

  useEffect(() => {
    if (!pathname || lastTracked.current === pathname) return;
    lastTracked.current = pathname;
    track({ name: "page.viewed", path: pathname });
    gaPageView(pathname);
  }, [pathname]);

  return null;
}
