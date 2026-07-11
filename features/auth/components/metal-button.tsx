import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Engraved bronze CTA — a pressed metal plate that sits on the letter sheet.
 * Plain button so it stays independent of the app-wide `ui/Button` variants.
 */
export function MetalButton({
  className,
  children,
  ...props
}: React.ComponentProps<"button">) {
  return (
    <button
      className={cn(
        "kyndl-btn-metal inline-flex w-full items-center justify-center rounded-full px-6 py-3 font-serif text-[15px] tracking-wide text-[#F7ECE2] disabled:cursor-not-allowed disabled:opacity-70",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
