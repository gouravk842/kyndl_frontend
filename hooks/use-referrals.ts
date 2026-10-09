"use client";

import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/constants/query-keys";
import { referralService } from "@/services/referrals/referral.service";
import { useAuthStore } from "@/store/auth.store";

export function useReferralProfile() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return useQuery({
    queryKey: queryKeys.referrals.me(),
    queryFn: () => referralService.me(),
    enabled: isAuthenticated,
    staleTime: 60_000,
  });
}

export function useReferralLinks() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return useQuery({
    queryKey: queryKeys.referrals.links(),
    queryFn: () => referralService.links(),
    enabled: isAuthenticated,
    staleTime: 60_000,
  });
}

export function useReferralConversions() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return useQuery({
    queryKey: queryKeys.referrals.conversions(),
    queryFn: () => referralService.conversions({ limit: 50 }),
    enabled: isAuthenticated,
  });
}
