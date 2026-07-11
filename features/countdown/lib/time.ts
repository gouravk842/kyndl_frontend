/** Pure time math for the countdown clock — no React, easy to reason about. */

export type Remaining = {
  /** Whole days/hours/minutes/seconds left, each already floored & clamped. */
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  /** Milliseconds remaining (0 once the moment has passed). */
  total: number;
  /** True once the target instant has arrived (or already gone). */
  reached: boolean;
};

const ZERO: Remaining = {
  days: 0,
  hours: 0,
  minutes: 0,
  seconds: 0,
  total: 0,
  reached: false,
};

/** Break the gap between `now` (ms epoch) and `targetIso` into clock units. */
export function remainingFrom(targetIso: string, now: number): Remaining {
  const target = new Date(targetIso).getTime();
  if (Number.isNaN(target)) return ZERO;

  const total = target - now;
  if (total <= 0) return { ...ZERO, reached: true };

  const s = Math.floor(total / 1000);
  return {
    days: Math.floor(s / 86400),
    hours: Math.floor((s % 86400) / 3600),
    minutes: Math.floor((s % 3600) / 60),
    seconds: s % 60,
    total,
    reached: false,
  };
}

/** A friendly absolute stamp for the target, e.g. "Sun, 14 Feb 2027, 7:00 PM". */
export function formatTarget(targetIso: string): string {
  const date = new Date(targetIso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
