import { type Remaining, remainingFrom } from "@/features/countdown/lib/time";

import type { Reason } from "../config";

export type UnlockPartition = {
  open: Reason[];
  locked: Reason[];
  /** Soonest still-locked reason, if any. */
  next: Reason | null;
  /** True when every reason is open (or the list is empty). */
  complete: boolean;
};

/** Split reasons by whether `unlockAt <= now`. */
export function partitionReasons(
  reasons: Reason[],
  now: number = Date.now(),
): UnlockPartition {
  const open: Reason[] = [];
  const locked: Reason[] = [];
  for (const r of reasons) {
    const t = Date.parse(r.unlockAt);
    if (!Number.isNaN(t) && t <= now) open.push(r);
    else locked.push(r);
  }
  locked.sort((a, b) => Date.parse(a.unlockAt) - Date.parse(b.unlockAt));
  const next = locked[0] ?? null;
  return {
    open,
    locked,
    next,
    complete: reasons.length > 0 && locked.length === 0,
  };
}

export function isReasonOpen(
  reason: Reason,
  now: number = Date.now(),
): boolean {
  const t = Date.parse(reason.unlockAt);
  return !Number.isNaN(t) && t <= now;
}

/** Countdown to the next locked reason (or already reached if none). */
export function nextUnlockRemaining(
  reasons: Reason[],
  now: number = Date.now(),
): { reason: Reason | null; remaining: Remaining } {
  const { next } = partitionReasons(reasons, now);
  if (!next) {
    return {
      reason: null,
      remaining: {
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        total: 0,
        reached: true,
      },
    };
  }
  return { reason: next, remaining: remainingFrom(next.unlockAt, now) };
}
