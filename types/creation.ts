/**
 * A "creation" is a user-authored experience stored on the backend
 * (`/api/v1/creations/`). The feature-specific document lives in `content`; for
 * a scrapbook that's a `ScrapbookStory`. `assets` is only present on detail
 * reads — a map of `fileId` → freshly signed media URL.
 */
import type { ScrapbookStory } from "@/features/scrapbook/types";

/** One derived rendition of an asset (e.g. `thumb`, `medium`), backend-generated. */
export interface CreationAssetVariant {
  url: string;
  content_type: string;
  size: number | null;
  width: number | null;
  height: number | null;
}

export interface CreationAsset {
  /** Read URL for the original (full-resolution) object. */
  url: string;
  content_type: string;
  size: number;
  expires_in: number;
  width?: number | null;
  height?: number | null;
  /** "ready" once derivatives exist; "queued"/"processing" while still generating. */
  processing_status?: string;
  /** Derived renditions keyed by name (`thumb`, `medium`); empty until processed. */
  variants?: Record<string, CreationAssetVariant>;
}

/**
 * Pick the smallest variant whose long edge is at least `minEdge`, falling back
 * to the original. Use `thumb` for grids/lists and `medium` for detail views so
 * the client never pulls a full-resolution original into a small slot.
 */
export function pickAssetUrl(
  asset: CreationAsset | undefined,
  minEdge = 0,
): string | null {
  if (!asset) return null;
  const ranked = Object.values(asset.variants ?? {})
    .filter((v) => v.url)
    .sort((a, b) => (a.width ?? 0) - (b.width ?? 0));
  const fit = ranked.find((v) => (v.width ?? 0) >= minEdge);
  return fit?.url ?? ranked[ranked.length - 1]?.url ?? asset.url ?? null;
}

export type CreationStatus = "draft" | "published";
/** Who can view a published creation. A draft is always owner-only. */
export type CreationVisibility = "public" | "invite";

export interface Creation<TContent = unknown> {
  id: string;
  type: string;
  title: string;
  content: TContent;
  content_version: number;
  status: CreationStatus;
  visibility: CreationVisibility;
  /** Stable handle for the public share URL (`/v/<public_token>`). */
  public_token: string;
  /** Canonical, ready-to-copy audience link, built server-side from the public
   *  site's base URL. Prefer this over reconstructing `/v/<public_token>`. */
  share_url: string;
  /** ISO timestamp of first publish, or null while still a draft. */
  published_at: string | null;
  /** Audience-interaction surfaces the owner has enabled on this creation. */
  comments_enabled: boolean;
  chat_enabled: boolean;
  reviews_enabled: boolean;
  /** Invited viewer emails (owner reads only); empty unless visibility is invite. */
  invites: string[];
  /**
   * The signed-in reader's standing on this creation: `owner`, `admin`,
   * `contributor`, or null. Lets the dashboard tell a shared page from an owned
   * one and gate owner/admin-only controls.
   */
  my_role?: "owner" | "admin" | "contributor" | null;
  /**
   * `authorId → display name` for memory attribution (owner + invited
   * contributors). The empty-string key is the owner (a blank `authorId` on a
   * memory means the owner). Only populated for `memory-pages` reads.
   */
  authors?: Record<string, string>;
  created_at: string;
  updated_at: string;
  /** Present on a single-creation read; resolved presigned URLs keyed by fileId. */
  assets?: Record<string, CreationAsset>;
}

export type ScrapbookCreation = Creation<ScrapbookStory>;

export interface CreateCreationPayload {
  type: string;
  title?: string;
  content?: unknown;
}

export interface UpdateCreationPayload {
  title?: string;
  content?: unknown;
  comments_enabled?: boolean;
  chat_enabled?: boolean;
  reviews_enabled?: boolean;
}

/** Body for `PATCH /creations/{id}/access/` — who can view a published creation. */
export interface AccessPayload {
  visibility: CreationVisibility;
  /** Exact set of invited emails (replace semantics); used when visibility is invite. */
  invites?: string[];
}

/** What a Moment's recipient sends back to the creator (snake_case to Django). */
export interface MomentResponsePayload {
  answer: "yes" | "no";
  note?: string;
  responder_name?: string;
}

export interface MomentResponse {
  id: string;
  answer: "yes" | "no";
  note: string;
  responder_name: string;
  created_at: string;
}

/** Desire Matcher answer maps (itemId → yes/maybe/no). */
export type MatchAnswer = "yes" | "maybe" | "no";

/** What the partner submits to a shared Matcher. */
export interface MatcherAnswersPayload {
  answers: Record<string, MatchAnswer>;
  responderName?: string;
}

export interface MatchRevealItem {
  id: string;
  label: string;
  heat: string;
}

/** The mutual reveal handed back after the partner answers. */
export interface MatcherReveal {
  matches: MatchRevealItem[];
  maybes: MatchRevealItem[];
  total: number;
}

export interface MatcherRespondResult {
  id: string;
  reveal: MatcherReveal;
}

/** What the partner sends to redeem a Love Coupon. */
export interface CouponRedeemPayload {
  couponId: string;
  message?: string;
  responderName?: string;
}

/** Owner-facing read of a single response (incl. the structured payload). */
export interface OwnedResponse {
  id: string;
  answer: string;
  note: string;
  responder_name: string;
  payload: {
    /** Matcher answers. */
    answers?: Record<string, MatchAnswer>;
    /** Love Coupons redemption. */
    couponId?: string;
    message?: string;
    responderName?: string;
  };
  created_at: string;
}
