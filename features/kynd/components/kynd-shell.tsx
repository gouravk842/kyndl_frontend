import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function KyndShell({
  children,
  width = "reading",
}: {
  children: ReactNode;
  width?: "reading" | "portrait";
}) {
  return (
    <div className="-m-6 min-h-[calc(100dvh-4rem)] bg-[#f6f0e9] px-5 py-8 text-[#2c2420] sm:px-10 sm:py-12 dark:bg-[#161311] dark:text-[#f6efe9]">
      <div
        className={cn(
          "mx-auto",
          width === "reading" ? "max-w-2xl" : "max-w-5xl",
        )}
      >
        {children}
      </div>
    </div>
  );
}
