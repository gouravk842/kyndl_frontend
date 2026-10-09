import type { ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export function KyndButton({
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        "inline-flex min-h-11 items-center justify-center rounded-full bg-[#2c2420] px-5 text-sm text-[#f6f0e9] transition-colors hover:bg-[#3a312c] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8e1020] disabled:pointer-events-none disabled:opacity-50 dark:bg-[#f6efe9] dark:text-[#2c2420] dark:hover:bg-white",
        className,
      )}
      {...props}
    />
  );
}

export function KyndTextButton({
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        "inline-flex min-h-11 items-center justify-center rounded-full px-3 text-sm text-[#5c4a43] underline-offset-4 hover:text-[#2c2420] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8e1020] disabled:pointer-events-none disabled:opacity-50 dark:text-[#cbb8ad] dark:hover:text-[#f6efe9]",
        className,
      )}
      {...props}
    />
  );
}
