import { apiRequest } from "@/services/api/client";
import type {
  Review,
  ReviewEligibility,
  ReviewInput,
  ReviewsBundle,
  ReviewTargetType,
} from "@/types/review";

// Same-origin Next BFF, which forwards to Django with the httpOnly access
// cookie as a bearer token. One generic surface serves products, vendors and
// experiences — `type` + `ref` name the target.
const BASE = "/reviews";

export const reviewService = {
  // Public: the rating summary + a page of reviews for a target, plus (when
  // signed in) the viewer's own review and whether they may post one.
  list(type: ReviewTargetType, ref: string, params?: { limit?: number; offset?: number }) {
    return apiRequest<ReviewsBundle>({
      method: "GET",
      url: `${BASE}/${type}/${encodeURIComponent(ref)}`,
      params,
    });
  },

  // Auth: create or update the signed-in user's review of a target.
  submit(type: ReviewTargetType, ref: string, input: ReviewInput) {
    return apiRequest<Review>({
      method: "POST",
      url: `${BASE}/${type}/${encodeURIComponent(ref)}`,
      data: input,
    });
  },

  // Auth: whether the current user may review this target.
  eligibility(type: ReviewTargetType, ref: string) {
    return apiRequest<ReviewEligibility>({
      method: "GET",
      url: `${BASE}/${type}/${encodeURIComponent(ref)}/eligibility`,
    });
  },

  // Auth: delete the user's own review.
  remove(reviewId: string) {
    return apiRequest<void>({ method: "DELETE", url: `${BASE}/mine/${reviewId}` });
  },
};
