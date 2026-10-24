"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

import { gaPageView } from "@/lib/analytics/ga";

/**
 * Fires a GA4 `page_view` on load and every client-side route change. Mounted
 * once near the root (see `AppProviders`). Product events go through `track()`
 * separately; page views are not stored first-party.
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
    gaPageView(pathname);
  }, [pathname]);

  return null;
}
