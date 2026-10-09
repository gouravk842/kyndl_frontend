import { apiRequest } from "@/services/api/client";
import type {
  AccessPayload,
  CouponRedeemPayload,
  CreateCreationPayload,
  Creation,
  MatcherAnswersPayload,
  MatcherRespondResult,
  MirrorMatchRespondResult,
  MomentResponse,
  MomentResponsePayload,
  OwnedResponse,
  UpdateCreationPayload,
} from "@/types/creation";

// Hits the same-origin Next BFF (`/api` baseURL on apiClient), which forwards to
// Django with the httpOnly access cookie as a bearer token.
const BASE = "/creations";

export const creationService = {
  // List the signed-in user's creations, optionally filtered by type.
  list<TContent = unknown>(type?: string) {
    return apiRequest<Creation<TContent>[]>({
      method: "GET",
      url: BASE,
      params: type ? { type } : undefined,
    });
  },

  // Read one creation with its resolved media `assets` map.
  get<TContent = unknown>(id: string) {
    return apiRequest<Creation<TContent>>({
      method: "GET",
      url: `${BASE}/${id}`,
    });
  },

  create<TContent = unknown>(payload: CreateCreationPayload) {
    return apiRequest<Creation<TContent>>({
      method: "POST",
      url: BASE,
      data: payload,
    });
  },

  // Save the document (whole-story, last-write-wins).
  update<TContent = unknown>(id: string, payload: UpdateCreationPayload) {
    return apiRequest<Creation<TContent>>({
      method: "PATCH",
      url: `${BASE}/${id}`,
      data: payload,
    });
  },

  remove(id: string) {
    return apiRequest<void>({
      method: "DELETE",
      url: `${BASE}/${id}`,
    });
  },

  // Take a creation live. Rejects with a 402 ApiError (whose `details.product`
  // names what to pay for) when the type is paid and not yet purchased.
  publish<TContent = unknown>(id: string) {
    return apiRequest<Creation<TContent>>({
      method: "POST",
      url: `${BASE}/${id}/publish`,
    });
  },

  unpublish<TContent = unknown>(id: string) {
    return apiRequest<Creation<TContent>>({
      method: "POST",
      url: `${BASE}/${id}/unpublish`,
    });
  },

  // Set who can view the creation (public / invite-by-email).
  setAccess<TContent = unknown>(id: string, payload: AccessPayload) {
    return apiRequest<Creation<TContent>>({
      method: "PATCH",
      url: `${BASE}/${id}/access`,
      data: payload,
    });
  },

  // Audience-facing read by public token (no ownership). Used by the /v viewer.
  getPublic<TContent = unknown>(token: string) {
    return apiRequest<Creation<TContent>>({
      method: "GET",
      url: `/public/creations/${token}`,
    });
  },

  // Audience-facing answer to a shared Moment (proposal / date-ask). The only
  // path data flows from a viewer back to the creator. No ownership required.
  respond(token: string, payload: MomentResponsePayload) {
    return apiRequest<MomentResponse>({
      method: "POST",
      url: `/public/creations/${token}/respond`,
      data: payload,
    });
  },

  // Submit a partner's per-item answers to a shared Matcher; the mutual reveal
  // is computed server-side (so neither side's private answers leak) and handed
  // straight back.
  submitMatch(token: string, payload: MatcherAnswersPayload) {
    return apiRequest<MatcherRespondResult>({
      method: "POST",
      url: `/public/creations/${token}/respond`,
      data: payload,
    });
  },

  // Same respond endpoint as submitMatch; typed for Mirror Match's softMatches reveal.
  submitMirrorMatch(token: string, payload: MatcherAnswersPayload) {
    return apiRequest<MirrorMatchRespondResult>({
      method: "POST",
      url: `/public/creations/${token}/respond`,
      data: payload,
    });
  },

  // Redeem a Love Coupon (records a response + pings the owner). Returns the
  // generic structured-response result; coupons have no reveal.
  // Leave one line in a shared Constellation. The author sees it as a faint star.
  leaveStar(token: string, payload: { line: string; responderName?: string }) {
    return apiRequest<{ id: string }>({
      method: "POST",
      url: `/public/creations/${token}/respond`,
      data: payload,
    });
  },

  redeemCoupon(token: string, payload: CouponRedeemPayload) {
    return apiRequest<{ id: string }>({
      method: "POST",
      url: `/public/creations/${token}/respond`,
      data: payload,
    });
  },

  // Owner-only: read the responses a creation has received (incl. the
  // structured Matcher payload / coupon redemptions). Used by owner results.
  responses(id: string) {
    return apiRequest<OwnedResponse[]>({
      method: "GET",
      url: `${BASE}/${id}/responses`,
    });
  },
};
