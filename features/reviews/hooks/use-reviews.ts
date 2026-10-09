"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { queryKeys } from "@/constants/query-keys";
import { reviewService } from "@/services/reviews/review.service";
import type { ApiError } from "@/types/api";
import type {
  ReviewInput,
  ReviewsBundle,
  ReviewTargetType,
} from "@/types/review";

function errorMessage(error: unknown, fallback: string): string {
  return (error as ApiError)?.message ?? fallback;
}

/** The full review bundle for a target: summary + reviews + viewer context. */
export function useReviews(type: ReviewTargetType, ref: string) {
  return useQuery({
    queryKey: queryKeys.reviews.list(type, ref),
    queryFn: () => reviewService.list(type, ref),
    enabled: Boolean(ref),
    staleTime: 30 * 1000,
  });
}

type SubmitOptions = {
  successMessage?: string;
  onSuccess?: (input: ReviewInput) => void;
};

/** Create or update the signed-in user's review, refreshing the panel. */
export function useSubmitReview(
  type: ReviewTargetType,
  ref: string,
  options?: SubmitOptions,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ReviewInput) => reviewService.submit(type, ref, input),
    onSuccess: (_data, input) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.reviews.list(type, ref),
      });
      // Ratings surface on catalog cards / product pages too — refresh them.
      queryClient.invalidateQueries({ queryKey: queryKeys.gifts.all });
      toast.success(options?.successMessage ?? "Thanks for your review!");
      options?.onSuccess?.(input);
    },
    onError: (error) => {
      toast.error(errorMessage(error, "Could not save your review."));
    },
  });
}

/** Delete the user's own review, optimistic on the target's panel. */
export function useDeleteReview(type: ReviewTargetType, ref: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (reviewId: string) => reviewService.remove(reviewId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.reviews.list(type, ref),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.gifts.all });
      toast.success("Review removed.");
    },
    onError: (error) => {
      toast.error(errorMessage(error, "Could not remove your review."));
    },
  });
}

export type { ReviewsBundle };
