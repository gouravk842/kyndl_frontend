"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import { queryKeys } from "@/constants/query-keys";
import {
  buildExperienceViews,
  type ExperienceView,
  filterCatalogExperiences,
  filterRedZoneExperiences,
  indexPricing,
} from "@/lib/experience-catalog";
import { paymentService } from "@/services/payments/payment.service";

/**
 * Client-side experience catalog merged with the backend control plane.
 * Use on surfaces that cannot take RSC props (mega menu, dashboard create rail).
 * Returns [] until the feed resolves so hidden products never flash visible.
 */
export function useExperienceCatalog() {
  const query = useQuery({
    queryKey: queryKeys.payments.pricing(),
    queryFn: () => paymentService.pricing(),
    staleTime: 60_000,
  });

  const views = useMemo(() => {
    if (!query.isSuccess || !query.data) return [] as ExperienceView[];
    return buildExperienceViews(indexPricing(query.data), true);
  }, [query.isSuccess, query.data]);

  return {
    ...query,
    views,
    catalog: filterCatalogExperiences(views),
    redZone: filterRedZoneExperiences(views),
  };
}
