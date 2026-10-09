import { MAX_VISIBLE_TITLES } from "../config";
import type { CalendarEvent, WeekStartsOn } from "../types";
import { anniversaryEventsOnDay, isTogetherAnniversaryDay } from "./together";

export interface CalendarDayCell {
  /** Absolute date for this cell, or null for decorative trailing pads. */
  date: Date | null;
  /** Day-of-month number when `inMonth`, else null. */
  day: number | null;
  inMonth: boolean;
  /** Events that land on this cell (exact date or yearly match). */
  events: CalendarEvent[];
  visibleTitles: string[];
  overflow: number;
  /** True when this is a trailing decorative empty cell past the month end. */
  decorative: boolean;
  /** Together-since anniversary or anniversary-category day — gold flare. */
  anniversaryHighlight: boolean;
}

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

const WEEKDAY_LABELS_SUN = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const WEEKDAY_LABELS_MON = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function monthLabel(year: number, monthIndex: number): string {
  return `${MONTH_NAMES[monthIndex] ?? ""} ${year}`.toUpperCase();
}

export function weekdayLabels(weekStartsOn: WeekStartsOn): string[] {
  return weekStartsOn === 1 ? WEEKDAY_LABELS_MON : WEEKDAY_LABELS_SUN;
}

/** Parse `YYYY-MM-DD` as a local calendar date (no UTC shift). */
export function parseDateKey(key: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(key);
  if (!m) return null;
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  const dt = new Date(y, mo - 1, d);
  if (
    dt.getFullYear() !== y ||
    dt.getMonth() !== mo - 1 ||
    dt.getDate() !== d
  ) {
    return null;
  }
  return dt;
}

export function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function eventsForDay(
  events: CalendarEvent[],
  year: number,
  monthIndex: number,
  day: number,
): CalendarEvent[] {
  return events.filter((ev) => {
    const dt = parseDateKey(ev.date);
    if (!dt) return false;
    if (ev.recursYearly) {
      return dt.getMonth() === monthIndex && dt.getDate() === day;
    }
    return (
      dt.getFullYear() === year &&
      dt.getMonth() === monthIndex &&
      dt.getDate() === day
    );
  });
}

/**
 * Build a 6×7 month matrix. Leading cells before day 1 are empty in-grid pads
 * (not decorative). Trailing cells after the last day of the month are marked
 * `decorative` for the ornate filler motif.
 */
export function buildMonthGrid(
  year: number,
  monthIndex: number,
  events: CalendarEvent[],
  weekStartsOn: WeekStartsOn = 0,
  togetherSince = "",
): CalendarDayCell[] {
  const first = new Date(year, monthIndex, 1);
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const rawDow = first.getDay(); // 0=Sun
  const startOffset = weekStartsOn === 1 ? (rawDow + 6) % 7 : rawDow;

  const cells: CalendarDayCell[] = [];
  const total = 42; // 6 weeks

  const emptyCell = (decorative: boolean): CalendarDayCell => ({
    date: null,
    day: null,
    inMonth: false,
    events: [],
    visibleTitles: [],
    overflow: 0,
    decorative,
    anniversaryHighlight: false,
  });

  for (let i = 0; i < total; i++) {
    const dayNum = i - startOffset + 1;
    if (dayNum < 1) {
      cells.push(emptyCell(false));
      continue;
    }
    if (dayNum > daysInMonth) {
      cells.push(emptyCell(true));
      continue;
    }

    const date = new Date(year, monthIndex, dayNum);
    const dayEvents = eventsForDay(events, year, monthIndex, dayNum);
    const titles = dayEvents.map((e) => e.title);
    const anniversaryHighlight =
      isTogetherAnniversaryDay(togetherSince, year, monthIndex, dayNum) ||
      anniversaryEventsOnDay(events, monthIndex, dayNum).length > 0;
    cells.push({
      date,
      day: dayNum,
      inMonth: true,
      events: dayEvents,
      visibleTitles: titles.slice(0, MAX_VISIBLE_TITLES),
      overflow: Math.max(0, titles.length - MAX_VISIBLE_TITLES),
      decorative: false,
      anniversaryHighlight,
    });
  }

  return cells;
}

/** Prefer the nearest month that has events; fall back to "today". */
export function initialViewMonth(events: CalendarEvent[]): {
  year: number;
  monthIndex: number;
} {
  const now = new Date();
  const thisYear = now.getFullYear();
  const thisMonth = now.getMonth();

  const hasThisMonth = events.some((ev) => {
    const dt = parseDateKey(ev.date);
    if (!dt) return false;
    if (ev.recursYearly) return dt.getMonth() === thisMonth;
    return dt.getFullYear() === thisYear && dt.getMonth() === thisMonth;
  });
  if (hasThisMonth || events.length === 0) {
    return { year: thisYear, monthIndex: thisMonth };
  }

  // Nearest absolute event date to today.
  let best: { year: number; monthIndex: number; dist: number } | null = null;
  for (const ev of events) {
    const dt = parseDateKey(ev.date);
    if (!dt) continue;
    const target = ev.recursYearly
      ? new Date(thisYear, dt.getMonth(), dt.getDate())
      : dt;
    const dist = Math.abs(target.getTime() - now.getTime());
    if (!best || dist < best.dist) {
      best = {
        year: target.getFullYear(),
        monthIndex: target.getMonth(),
        dist,
      };
    }
  }
  return best
    ? { year: best.year, monthIndex: best.monthIndex }
    : { year: thisYear, monthIndex: thisMonth };
}

export function shiftMonth(
  year: number,
  monthIndex: number,
  delta: number,
): { year: number; monthIndex: number } {
  const d = new Date(year, monthIndex + delta, 1);
  return { year: d.getFullYear(), monthIndex: d.getMonth() };
}
