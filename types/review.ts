/**
 * Ratings & reviews shapes, mirrored from the Django `reviews` app. One review
 * system serves every reviewable thing in the app, keyed by a target type:
 *   - "product"    — a gift, referenced by slug
 *   - "vendor"     — a shop, referenced by slug
 *   - "experience" — a published creation, referenced by its share token
 */

export type ReviewTargetType = "product" | "vendor" | "experience";

export interface Review {
  id: string;
  author_name: string;
  rating: number;
  title: string;
  body: string;
  is_verified: boolean;
  is_mine: boolean;
  created_at: string;
  updated_at: string;
}

/** Star distribution, keyed by star value ("5".."1") to review count. */
export type RatingDistribution = Record<string, number>;

export interface ReviewSummary {
  average: number;
  count: number;
  distribution: RatingDistribution;
}

/** Whether the signed-in viewer may post a review (drives showing the form). */
export interface ReviewEligibility {
  allowed: boolean;
  verified: boolean;
  reason: string;
  has_reviewed: boolean;
}

/** Small label block describing the reviewed target. */
export interface ReviewTarget {
  type: ReviewTargetType;
  name: string;
  slug?: string;
  token?: string;
  image_url?: string;
  experience_type?: string;
}

/** The bundle `GET /reviews/<type>/<ref>/` returns — everything a panel needs. */
export interface ReviewsBundle {
  target: ReviewTarget;
  summary: ReviewSummary;
  reviews: Review[];
  my_review: Review | null;
  can_review: ReviewEligibility | null;
}

export interface ReviewInput {
  rating: number;
  title?: string;
  body?: string;
}
