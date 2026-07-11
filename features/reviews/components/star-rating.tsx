"use client";

import { Star } from "lucide-react";
import { useState } from "react";

import { cn } from "@/lib/utils";

const SIZES = {
  sm: "size-3.5",
  md: "size-4",
  lg: "size-6",
} as const;

interface StarRatingProps {
  /** Current value (0–5). Fractional values render partial fill in read mode. */
  value: number;
  /** Star pixel size. */
  size?: keyof typeof SIZES;
  className?: string;
}

/** Read-only star row. Supports fractional averages (e.g. 4.3 → 4.3 stars). */
export function StarRating({ value, size = "md", className }: StarRatingProps) {
  return (
    <span className={cn("inline-flex items-center gap-0.5", className)} aria-label={`${value} out of 5`}>
      {[1, 2, 3, 4, 5].map((star) => {
        const fill = Math.max(0, Math.min(1, value - (star - 1)));
        return (
          <span key={star} className={cn("relative", SIZES[size])}>
            <Star className={cn(SIZES[size], "absolute inset-0 text-amber-400/30")} />
            <span className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
              <Star className={cn(SIZES[size], "fill-amber-400 text-amber-400")} />
            </span>
          </span>
        );
      })}
    </span>
  );
}

interface StarRatingInputProps {
  value: number;
  onChange: (value: number) => void;
  size?: keyof typeof SIZES;
  disabled?: boolean;
  className?: string;
}

/** Interactive 1–5 star picker with hover preview and keyboard support. */
export function StarRatingInput({
  value,
  onChange,
  size = "lg",
  disabled,
  className,
}: StarRatingInputProps) {
  const [hover, setHover] = useState(0);
  const shown = hover || value;

  return (
    <div
      className={cn("inline-flex items-center gap-1", disabled && "opacity-50", className)}
      role="radiogroup"
      aria-label="Your rating"
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          role="radio"
          aria-checked={value === star}
          aria-label={`${star} star${star > 1 ? "s" : ""}`}
          disabled={disabled}
          onMouseEnter={() => !disabled && setHover(star)}
          onMouseLeave={() => setHover(0)}
          onClick={() => !disabled && onChange(star)}
          className="rounded-full p-0.5 transition-transform hover:scale-110 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none disabled:cursor-not-allowed"
        >
          <Star
            className={cn(
              SIZES[size],
              star <= shown ? "fill-amber-400 text-amber-400" : "text-muted-foreground/40",
            )}
          />
        </button>
      ))}
    </div>
  );
}
