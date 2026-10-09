"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Skeleton } from "@/components/ui/skeleton";
import { ROUTES } from "@/constants/routes";
import { captureOccasionReminderIntent } from "@/features/recipient-aftermath/lib/occasion-reminder";
import { cn } from "@/lib/utils";
import { track } from "@/services/analytics/analytics.service";
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
  /** Softens copy + enables UGC marketing consent for recipient reactions. */
  tone?: "default" | "keepsake";
  /** Experience slug — used for keepsake analytics / reminder seeds. */
  experienceType?: string;
}

/**
 * Drop-in reviews panel for any reviewable target. Fetches the summary +
 * reviews, gates the write form behind sign-in and server-side eligibility
 * (verified buyers/recipients only), and lets a user edit or delete their own
 * review. Reused as-is by gifts, vendors and experiences.
 */
export function ReviewsSection({
  type,
  refId,
  title = "Ratings & reviews",
  className,
  tone = "default",
  experienceType,
}: ReviewsSectionProps) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const pathname = usePathname();
  const keepsake = tone === "keepsake";

  const { data, isLoading, isError } = useReviews(type, refId);
  const submit = useSubmitReview(type, refId, {
    successMessage: keepsake ? "Thanks for sharing how it felt." : undefined,
    onSuccess: (input) => {
      if (!keepsake || type !== "experience") return;
      track({
        name: "share.reaction_submitted",
        properties: {
          experience_type: experienceType,
          from_token: refId,
          rating: input.rating,
          allow_marketing_use: Boolean(input.allow_marketing_use),
        },
      });
      if (experienceType) {
        captureOccasionReminderIntent({
          experienceType,
          fromToken: refId,
          triggeredBy: "reaction",
        });
      }
    },
  });
  const remove = useDeleteReview(type, refId);

  return (
    <section className={cn("space-y-5", className)}>
      {title ? (
        <h2 className="text-xl font-semibold text-foreground">{title}</h2>
      ) : null}

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-28 w-full rounded-2xl" />
          <Skeleton className="h-20 w-full rounded-2xl" />
        </div>
      ) : isError || !data ? (
        // The request failed (e.g. the experience isn't published yet) — say so
        // instead of spinning forever on a skeleton that never resolves.
        <div className="rounded-2xl border border-border bg-card p-5 text-sm text-muted-foreground">
          {keepsake
            ? "Reactions aren't available here yet."
            : "Reviews aren't available here yet."}
        </div>
      ) : (
        <>
          {!keepsake && <RatingSummary summary={data.summary} />}

          {/* ── Write surface ─────────────────────────────────────────── */}
          {isHydrated && !isAuthenticated && (
            <div className="rounded-2xl border border-border bg-card p-5 text-sm text-muted-foreground">
              <Link
                href={`${ROUTES.login}?callbackUrl=${encodeURIComponent(pathname)}`}
                className="font-medium text-primary underline-offset-4 hover:underline"
              >
                Sign in
              </Link>{" "}
              {keepsake ? "to share how this felt." : "to share your review."}
            </div>
          )}

          {isAuthenticated && data.can_review?.allowed && (
            <ReviewForm
              existing={data.my_review}
              submitting={submit.isPending}
              tone={tone}
              onSubmit={(input) => submit.mutate(input)}
            />
          )}

          {isAuthenticated && data.can_review && !data.can_review.allowed && (
            <div className="rounded-2xl border border-border bg-card p-5 text-sm text-muted-foreground">
              {data.can_review.reason ||
                (keepsake
                  ? "You're not able to react here yet."
                  : "You're not able to review this yet.")}
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
