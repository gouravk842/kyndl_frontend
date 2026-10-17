import { apiRequest } from "@/services/api/client";
import type {
  QuotaCheckoutResponse,
  QuotaFeature,
  QuotaStatus,
} from "@/types/quota";

const BASE = "/quotas";

export const quotaService = {
  status(feature: QuotaFeature) {
    return apiRequest<QuotaStatus>({
      method: "GET",
      url: `${BASE}/${feature}`,
    });
  },

  checkout(feature: QuotaFeature, pack_code: string) {
    return apiRequest<QuotaCheckoutResponse>({
      method: "POST",
      url: `${BASE}/${feature}/checkout`,
      data: { pack_code },
    });
  },
};
