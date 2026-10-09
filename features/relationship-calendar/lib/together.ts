/**
 * Together-since / anniversary helpers for the Relationship Calendar.
 * Dates are local calendar days (`YYYY-MM-DD`), never UTC instants.
 */

import type { CalendarEvent } from "../types";
import { parseDateKey, toDateKey } from "./calendar";

export function daysTogether(
  togetherSince: string,
  today = new Date(),
): number | null {
  const start = parseDateKey(togetherSince);
  if (!start) return null;
  const startMid = new Date(
    start.getFullYear(),
    start.getMonth(),
    start.getDate(),
  );
  const todayMid = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );
  const diff = todayMid.getTime() - startMid.getTime();
  if (diff < 0) return null;
  return Math.floor(diff / 86_400_000);
}

/** e.g. "2y 14d" or "14d" or "Today". */
export function formatTogetherFor(
  togetherSince: string,
  today = new Date(),
): string | null {
  const days = daysTogether(togetherSince, today);
  if (days === null) return null;
  if (days === 0) return "Today";
  const years = Math.floor(days / 365);
  const rem = days - years * 365;
  if (years <= 0) return `${days}d`;
  if (rem === 0) return `${years}y`;
  return `${years}y ${rem}d`;
}

/** Next occurrence of the month+day in `togetherSince` (today if it is today). */
export function nextAnniversaryDate(
  togetherSince: string,
  today = new Date(),
): Date | null {
  const start = parseDateKey(togetherSince);
  if (!start) return null;
  const y = today.getFullYear();
  let next = new Date(y, start.getMonth(), start.getDate());
  const todayMid = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );
  if (next < todayMid) {
    next = new Date(y + 1, start.getMonth(), start.getDate());
  }
  return next;
}

export function isAnniversaryToday(
  togetherSince: string,
  today = new Date(),
): boolean {
  const start = parseDateKey(togetherSince);
  if (!start) return false;
  return (
    start.getMonth() === today.getMonth() && start.getDate() === today.getDate()
  );
}

export function daysUntilAnniversary(
  togetherSince: string,
  today = new Date(),
): number | null {
  const next = nextAnniversaryDate(togetherSince, today);
  if (!next) return null;
  const todayMid = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );
  return Math.round((next.getTime() - todayMid.getTime()) / 86_400_000);
}

/** True when this calendar day is the together-since anniversary (any year). */
export function isTogetherAnniversaryDay(
  togetherSince: string,
  year: number,
  monthIndex: number,
  day: number,
): boolean {
  const start = parseDateKey(togetherSince);
  if (!start) return false;
  return start.getMonth() === monthIndex && start.getDate() === day;
}

/** Anniversary event titles that land on this month+day (any year). */
export function anniversaryEventsOnDay(
  events: CalendarEvent[],
  monthIndex: number,
  day: number,
): CalendarEvent[] {
  return events.filter((ev) => {
    if (ev.category !== "anniversary") return false;
    const dt = parseDateKey(ev.date);
    if (!dt) return false;
    return dt.getMonth() === monthIndex && dt.getDate() === day;
  });
}

export function nextAnniversaryLabel(
  togetherSince: string,
  today = new Date(),
): string | null {
  const days = daysUntilAnniversary(togetherSince, today);
  if (days === null) return null;
  if (days === 0) return "Anniversary today";
  if (days === 1) return "Anniversary tomorrow";
  const next = nextAnniversaryDate(togetherSince, today);
  if (!next) return null;
  const when = next.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
  return `Next anniversary ${when} · ${days}d`;
}

export { toDateKey };
