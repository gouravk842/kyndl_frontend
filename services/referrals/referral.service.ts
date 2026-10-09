import { apiRequest } from "@/services/api/client";
import type {
  ReferralConversion,
  ReferralLinksPayload,
  ReferralProfile,
} from "@/types/referral";

const BASE = "/referrals";

export const referralService = {
  me() {
    return apiRequest<ReferralProfile>({
      method: "GET",
      url: `${BASE}/me`,
    });
  },

  links() {
    return apiRequest<ReferralLinksPayload>({
      method: "GET",
      url: `${BASE}/me/links`,
    });
  },

  conversions(params?: { limit?: number; offset?: number }) {
    const search = new URLSearchParams();
    if (params?.limit != null) search.set("limit", String(params.limit));
    if (params?.offset != null) search.set("offset", String(params.offset));
    const qs = search.toString();
    return apiRequest<{ count: number; results: ReferralConversion[] }>({
      method: "GET",
      url: `${BASE}/me/conversions${qs ? `?${qs}` : ""}`,
    });
  },

  recordClick(payload: {
    code: string;
    anonymous_id?: string;
    target_kind?: string;
    target_slug?: string;
    path?: string;
  }) {
    return apiRequest<{ id: string; landed_at: string }>({
      method: "POST",
      url: `${BASE}/clicks`,
      data: payload,
    });
  },
};
