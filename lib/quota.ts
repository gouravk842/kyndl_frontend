import type { ApiError } from "@/types/api";
import type { QuotaFeature, QuotaPack, QuotaStatus } from "@/types/quota";

export function isQuotaExceeded(error: unknown): error is ApiError {
  const err = error as ApiError;
  return err?.code === "quota_exceeded" && err.status === 402;
}

export function quotaStatusFromError(
  error: ApiError,
  feature: QuotaFeature,
): QuotaStatus {
  const body = error.details ?? {};
  return {
    feature,
    enabled: true,
    used: Number(body.used ?? 0),
    limit: body.limit == null ? null : Number(body.limit),
    free_units: Number(body.free_units ?? 0),
    purchased_units: Number(body.purchased_units ?? 0),
    packs: Array.isArray(body.packs) ? (body.packs as QuotaPack[]) : [],
  };
}

export function formatPackPrice(amountPaise: number, currency = "INR"): string {
  const major = amountPaise / 100;
  if (currency === "INR") {
    return `₹${major % 1 === 0 ? major.toFixed(0) : major.toFixed(2)}`;
  }
  return `${major.toFixed(2)} ${currency}`;
}
