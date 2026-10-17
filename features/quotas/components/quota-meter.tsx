"use client";

import { useFeatureQuota } from "@/hooks/use-quota";
import { cn } from "@/lib/utils";
import type { QuotaFeature } from "@/types/quota";

export function QuotaMeter({
  feature,
  className,
  unitLabel,
}: {
  feature: QuotaFeature;
  className?: string;
  /** e.g. "memories" or "notes" */
  unitLabel: string;
}) {
  const { data, isLoading } = useFeatureQuota(feature);

  if (isLoading || !data || !data.enabled || data.limit == null) {
    return null;
  }

  const remaining = Math.max(0, data.limit - data.used);
  const tight = remaining <= 3;

  return (
    <p
      className={cn(
        "text-xs tabular-nums",
        tight ? "text-[#b45309] dark:text-amber-300" : "text-muted-foreground",
        className,
      )}
      title={`${data.used} of ${data.limit} ${unitLabel} used (${data.free_units} free + ${data.purchased_units} purchased)`}
    >
      {data.used} / {data.limit} {unitLabel}
      {remaining === 0 ? " · add a pack to keep more" : null}
    </p>
  );
}
