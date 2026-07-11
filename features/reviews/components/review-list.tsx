"use client";

import { BadgeCheck, Trash2 } from "lucide-react";

import { cn } from "@/lib/utils";
import type { Review } from "@/types/review";

import { StarRating } from "./star-rating";

function formatDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(new Date(iso));
  } catch {
    return "";
  }
}

function initials(name: string): string {
  return name
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

interface ReviewListProps {
  reviews: Review[];
  onDelete?: (reviewId: string) => void;
  deletingId?: string | null;
}

export function ReviewList({ reviews, onDelete, deletingId }: ReviewListProps) {
  if (reviews.length === 0) return null;

  return (
    <ul className="divide-y divide-border">
      {reviews.map((review) => (
        <li key={review.id} className="py-5 first:pt-0">
          <div className="flex items-start gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground">
              {initials(review.author_name)}
            </span>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <span className="text-sm font-medium text-foreground">{review.author_name}</span>
                {review.is_verified && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                    <BadgeCheck className="size-3" /> Verified
                  </span>
                )}
                {review.is_mine && (
                  <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                    You
                  </span>
                )}
              </div>

              <div className="mt-1 flex items-center gap-2">
                <StarRating value={review.rating} size="sm" />
                <span className="text-xs text-muted-foreground">{formatDate(review.created_at)}</span>
              </div>

              {review.title && (
                <p className="mt-2 text-sm font-medium text-foreground">{review.title}</p>
              )}
              {review.body && (
                <p className="mt-1 text-sm leading-relaxed whitespace-pre-line text-muted-foreground">
                  {review.body}
                </p>
              )}
            </div>

            {review.is_mine && onDelete && (
              <button
                type="button"
                onClick={() => onDelete(review.id)}
                disabled={deletingId === review.id}
                aria-label="Delete your review"
                className={cn(
                  "shrink-0 rounded-full p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive",
                  "disabled:pointer-events-none disabled:opacity-50",
                )}
              >
                <Trash2 className="size-4" />
              </button>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
