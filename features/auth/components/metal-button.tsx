import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Primary auth CTA — same coral gradient as the marketing Kyndl button.
 */
export function MetalButton({
  className,
  children,
  ...props
}: React.ComponentProps<"button">) {
  return (
    <button
      className={cn(
        "kyndl-glow-warm inline-flex h-11 w-full items-center justify-center rounded-full bg-gradient-to-r from-[#FF7A59] to-[#F2596F] px-6 text-sm font-medium text-white transition-all duration-300",
        "hover:-translate-y-0.5 hover:shadow-[0_22px_50px_-14px_rgba(242,89,111,0.6)]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F2596F]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#FFF7F1]",
        "disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
