"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

interface PageTransitionProps {
  children: ReactNode;
}

/**
 * Light route enter fade — keeps marketing feel without AnimatePresence
 * mode="wait" (which blocks the next page until the previous exits).
 */
export function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();

  return (
    <div
      key={pathname}
      className="animate-in fade-in slide-in-from-bottom-1 duration-300 fill-mode-both"
    >
      {children}
    </div>
  );
}
