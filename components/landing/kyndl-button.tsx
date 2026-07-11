import Link from "next/link";
import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

type KyndlButtonProps = ComponentProps<typeof Link> & {
  variant?: "primary" | "secondary" | "ghost";
  size?: "default" | "lg";
};

const variants = {
  primary:
    "bg-gradient-to-r from-[#FF7A59] to-[#F2596F] text-white kyndl-glow-warm hover:-translate-y-0.5 hover:shadow-[0_22px_50px_-14px_rgba(242,89,111,0.6)]",
  secondary:
    "bg-white/70 text-[#3A2A25] border border-[#F2DACE] hover:border-[#FF7A59]/50 hover:bg-white",
  ghost: "bg-transparent text-[#92786C] hover:text-[#3A2A25]",
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
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F2596F]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#FFF7F1]",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  );
}
