import { getAnonymousId } from "@/services/analytics/analytics.service";
import { apiRequest } from "@/services/api/client";
import type {
  PairingsResponse,
  QuizAnswers,
  QuizResponse,
  RecommendationKind,
  SeededRecommendationResponse,
} from "@/types/recommendation";

const BASE = "/recommendations";

function withAnon<T extends Record<string, unknown>>(
  data: T,
): T & { anonymous_id: string } {
  return { ...data, anonymous_id: getAnonymousId() };
}

export const recommendationService = {
  quiz(answers: QuizAnswers) {
    return apiRequest<QuizResponse>({
      method: "POST",
      url: `${BASE}/quiz`,
      data: withAnon(answers as Record<string, unknown>),
    });
  },

  forYou(limit = 12) {
    const anonymous_id = getAnonymousId();
    return apiRequest<QuizResponse>({
      method: "GET",
      url: `${BASE}/for-you`,
      params: { limit, anonymous_id },
    });
  },

  postPurchase(payload: {
    seed_kind?: RecommendationKind;
    seed_id?: string;
    order_id?: string;
    creation_id?: string;
    payment_id?: string;
    adult_ok?: boolean;
    limit?: number;
  }) {
    return apiRequest<SeededRecommendationResponse>({
      method: "POST",
      url: `${BASE}/post-purchase`,
      data: withAnon(payload),
    });
  },

  pairings(
    kind: RecommendationKind,
    id: string,
    opts?: { adult_ok?: boolean; limit?: number },
  ) {
    const anonymous_id = getAnonymousId();
    return apiRequest<PairingsResponse>({
      method: "GET",
      url: `${BASE}/pairings/${kind}/${id}`,
      params: {
        anonymous_id,
        adult_ok: opts?.adult_ok ? "true" : "false",
        limit: opts?.limit ?? 8,
      },
    });
  },

  trackEvents(
    events: {
      context: string;
      action: string;
      kind: RecommendationKind;
      id: string;
      rank?: number;
      seed_kind?: string;
      seed_id?: string;
    }[],
  ) {
    return apiRequest<{ recorded: number }>({
      method: "POST",
      url: `${BASE}/events`,
      data: withAnon({ events }),
    }).catch(() => ({ recorded: 0 }));
  },
};
