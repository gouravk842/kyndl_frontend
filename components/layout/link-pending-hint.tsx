"use client";

import { useLinkStatus } from "next/link";
import { useEffect, useRef } from "react";

import { cn } from "@/lib/utils";

/**
 * Fixed-size pending dot for chrome links. Must render as a descendant of
 * `next/link`. Delayed CSS keeps fast navigations from flashing.
 */
export function LinkPendingHint({ className }: { className?: string }) {
  const { pending } = useLinkStatus();
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const link = ref.current?.closest("a");
    if (!link) return;
    if (pending) link.setAttribute("aria-busy", "true");
    else link.removeAttribute("aria-busy");
    return () => link.removeAttribute("aria-busy");
  }, [pending]);

  return (
    <span
      ref={ref}
      aria-hidden
      className={cn("link-pending-hint", pending && "is-pending", className)}
    />
  );
}
