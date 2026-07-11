"use client";

import { cn } from "@/lib/utils";
import type { ReviewSummary } from "@/types/review";

import { StarRating } from "./star-rating";

/** Compact inline "4.6 ★ (128)" badge for cards and headers. */
export function RatingBadge({
  average,
  count,
  className,
}: {
  average: number;
  count: number;
  className?: string;
}) {
  if (count === 0) {
    return <span className={cn("text-sm text-muted-foreground", className)}>No reviews yet</span>;
  }
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-sm", className)}>
      <StarRating value={average} size="sm" />
      <span className="font-medium text-foreground">{average.toFixed(1)}</span>
      <span className="text-muted-foreground">
        ({count} review{count === 1 ? "" : "s"})
      </span>
    </span>
  );
}

/** Full summary block: big average, star row, and per-star distribution bars. */
export function RatingSummary({ summary }: { summary: ReviewSummary }) {
  const { average, count, distribution } = summary;

  if (count === 0) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6 text-center">
        <p className="text-sm text-muted-foreground">
          No reviews yet — be the first to share your experience.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 rounded-2xl border border-border bg-card p-6 sm:flex-row sm:items-center">
      <div className="flex flex-col items-center justify-center gap-1 sm:w-40 sm:border-r sm:border-border sm:pr-6">
        <span className="text-4xl font-semibold text-foreground">{average.toFixed(1)}</span>
        <StarRating value={average} size="md" />
        <span className="text-xs text-muted-foreground">
          {count} review{count === 1 ? "" : "s"}
        </span>
      </div>

      <div className="flex-1 space-y-1.5">
        {[5, 4, 3, 2, 1].map((star) => {
          const n = distribution[String(star)] ?? 0;
          const pct = count ? (n / count) * 100 : 0;
          return (
            <div key={star} className="flex items-center gap-2 text-xs">
              <span className="w-3 text-muted-foreground">{star}</span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-amber-400 transition-[width] duration-500"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="w-8 text-right text-muted-foreground">{n}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
