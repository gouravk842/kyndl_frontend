"use client";

import { useQuery } from "@tanstack/react-query";

import { RecommendationRail } from "@/features/recommendations/components/recommendation-rail";
import { hasRedZoneConsent } from "@/lib/red-zone-consent";
import { recommendationService } from "@/services/recommendations/recommendation.service";
import type { RecommendationKind } from "@/types/recommendation";

export function CompanionRecommendations({
  seedKind,
  seedId,
  orderId,
  creationId,
  title = "Goes beautifully with this",
  subtitle = "A digital keepsake and a physical gift — hand in hand.",
  className,
}: {
  seedKind?: RecommendationKind;
  seedId?: string;
  orderId?: string;
  creationId?: string;
  title?: string;
  subtitle?: string;
  className?: string;
}) {
  const enabled =
    Boolean(seedKind && seedId) || Boolean(orderId) || Boolean(creationId);

  const { data, isLoading } = useQuery({
    queryKey: [
      "recommendations",
      "post-purchase",
      seedKind,
      seedId,
      orderId,
      creationId,
    ],
    enabled,
    queryFn: () =>
      recommendationService.postPurchase({
        seed_kind: seedKind,
        seed_id: seedId,
        order_id: orderId,
        creation_id: creationId,
        adult_ok: hasRedZoneConsent(),
        limit: 8,
      }),
  });

  if (!enabled || isLoading || !data?.results?.length) return null;

  return (
    <RecommendationRail
      title={title}
      subtitle={subtitle}
      items={data.results}
      context="post_purchase"
      className={className ?? "mt-8"}
    />
  );
}

export function RelatedPairings({
  kind,
  id,
  title = "You might also love",
}: {
  kind: RecommendationKind;
  id: string;
  title?: string;
}) {
  const { data, isLoading } = useQuery({
    queryKey: ["recommendations", "pairings", kind, id],
    queryFn: () =>
      recommendationService.pairings(kind, id, {
        adult_ok: hasRedZoneConsent(),
        limit: 6,
      }),
  });

  if (isLoading || !data?.results?.length) return null;

  return (
    <RecommendationRail
      title={title}
      items={data.results}
      context="pairings"
      className="mt-12"
    />
  );
}
