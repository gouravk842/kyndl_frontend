import Link from "next/link";
import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

type KyndlButtonProps = ComponentProps<typeof Link> & {
  variant?: "primary" | "secondary" | "ghost";
  size?: "default" | "lg";
};

const variants = {
  primary:
    "bg-[#B11226] text-[#F5E9E2] border border-[#C21830]/30 kyndl-glow-red hover:bg-[#C21830] hover:shadow-[0_0_32px_oklch(0.45_0.18_25_/_45%)]",
  secondary:
    "bg-transparent text-[#F5E9E2] border border-[#B3B3B3]/25 hover:border-[#C21830]/40 hover:bg-[#151515]/80",
  ghost: "bg-transparent text-[#B3B3B3] hover:text-[#F5E9E2]",
};

const sizes = {
  default: "h-10 px-6 text-sm",
  lg: "h-12 px-8 text-base",
};

export function KyndlButton({
  className,
  variant = "primary",
  size = "default",
  ...props
}: KyndlButtonProps) {
  return (
    <Link
      className={cn(
        "inline-flex items-center justify-center rounded-full font-medium transition-all duration-500 ease-out",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C21830]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#090909]",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  );
}
