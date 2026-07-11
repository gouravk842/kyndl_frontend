"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Skeleton } from "@/components/ui/skeleton";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth.store";
import type { ReviewTargetType } from "@/types/review";

import {
  useDeleteReview,
  useReviews,
  useSubmitReview,
} from "../hooks/use-reviews";
import { RatingSummary } from "./rating-summary";
import { ReviewForm } from "./review-form";
import { ReviewList } from "./review-list";

interface ReviewsSectionProps {
  type: ReviewTargetType;
  /** Public handle of the target (product/vendor slug, or experience token). */
  refId: string;
  title?: string;
  className?: string;
}

/**
 * Drop-in reviews panel for any reviewable target. Fetches the summary +
 * reviews, gates the write form behind sign-in and server-side eligibility
 * (verified buyers/recipients only), and lets a user edit or delete their own
 * review. Reused as-is by gifts, vendors and experiences.
 */
export function ReviewsSection({ type, refId, title = "Ratings & reviews", className }: ReviewsSectionProps) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const pathname = usePathname();

  const { data, isLoading, isError } = useReviews(type, refId);
  const submit = useSubmitReview(type, refId);
  const remove = useDeleteReview(type, refId);

  return (
    <section className={cn("space-y-5", className)}>
      <h2 className="text-xl font-semibold text-foreground">{title}</h2>

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-28 w-full rounded-2xl" />
          <Skeleton className="h-20 w-full rounded-2xl" />
        </div>
      ) : isError || !data ? (
        // The request failed (e.g. the experience isn't published yet) — say so
        // instead of spinning forever on a skeleton that never resolves.
        <div className="rounded-2xl border border-border bg-card p-5 text-sm text-muted-foreground">
          Reviews aren&apos;t available here yet.
        </div>
      ) : (
        <>
          <RatingSummary summary={data.summary} />

          {/* ── Write surface ─────────────────────────────────────────── */}
          {isHydrated && !isAuthenticated && (
            <div className="rounded-2xl border border-border bg-card p-5 text-sm text-muted-foreground">
              <Link
                href={`${ROUTES.login}?callbackUrl=${encodeURIComponent(pathname)}`}
                className="font-medium text-primary underline-offset-4 hover:underline"
              >
                Sign in
              </Link>{" "}
              to share your review.
            </div>
          )}

          {isAuthenticated && data.can_review?.allowed && (
            <ReviewForm
              existing={data.my_review}
              submitting={submit.isPending}
              onSubmit={(input) => submit.mutate(input)}
            />
          )}

          {isAuthenticated && data.can_review && !data.can_review.allowed && (
            <div className="rounded-2xl border border-border bg-card p-5 text-sm text-muted-foreground">
              {data.can_review.reason || "You're not able to review this yet."}
            </div>
          )}

          {/* ── Reviews ───────────────────────────────────────────────── */}
          {data.reviews.length > 0 ? (
            <ReviewList
              reviews={data.reviews}
              onDelete={(id) => remove.mutate(id)}
              deletingId={remove.isPending ? remove.variables : null}
            />
          ) : null}
        </>
      )}
    </section>
  );
}
