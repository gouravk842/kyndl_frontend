"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

import { CATEGORY_COLORS, CATEGORY_GLYPH } from "../config";
import {
  buildMonthGrid,
  type CalendarDayCell,
  monthLabel,
  toDateKey,
  weekdayLabels,
} from "../lib/calendar";
import {
  formatTogetherFor,
  isAnniversaryToday,
  nextAnniversaryLabel,
} from "../lib/together";
import type { CalendarEvent, WeekStartsOn } from "../types";

export interface CalendarGridProps {
  year: number;
  monthIndex: number;
  events: CalendarEvent[];
  weekStartsOn?: WeekStartsOn;
  title: string;
  subtitle?: string;
  partnerNames?: string;
  togetherSince?: string;
  /** Resolve a photo URL for an event (local preview or assets). */
  resolvePhoto?: (event: CalendarEvent) => string | null;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  /** Builder: click empty in-month day to add. */
  onDayClick?: (dateKey: string) => void;
  /** Click an event (builder edit / viewer detail). */
  onEventClick?: (event: CalendarEvent) => void;
  interactive?: boolean;
  /**
   * `fit` — fill a fixed parent (product-page hero frame) with no scroll.
   * `default` — natural height for builder / full public viewer.
   */
  variant?: "default" | "fit";
  className?: string;
}

/**
 * Ornate month grid — parchment field, gold lines, date top-left, labels,
 * photo thumb or category glyph at the bottom. Shared by builder and viewer.
 */
export function CalendarGrid({
  year,
  monthIndex,
  events,
  weekStartsOn = 0,
  title,
  subtitle,
  partnerNames,
  togetherSince = "",
  resolvePhoto,
  onPrevMonth,
  onNextMonth,
  onDayClick,
  onEventClick,
  interactive = false,
  variant = "default",
  className,
}: CalendarGridProps) {
  const cells = buildMonthGrid(
    year,
    monthIndex,
    events,
    weekStartsOn,
    togetherSince,
  );
  const weekdays = weekdayLabels(weekStartsOn);
  const fit = variant === "fit";
  const togetherLabel = togetherSince ? formatTogetherFor(togetherSince) : null;
  const anniversaryLine = togetherSince
    ? nextAnniversaryLabel(togetherSince)
    : null;
  const anniversaryToday = togetherSince
    ? isAnniversaryToday(togetherSince)
    : false;

  return (
    <div
      className={cn(
        "relative mx-auto w-full",
        fit
          ? "flex h-full max-w-none flex-col p-2 sm:p-3"
          : "max-w-4xl px-3 py-6 sm:px-6 sm:py-8",
        className,
      )}
    >
      <OrnateFrame fit={fit}>
        <header
          className={cn(
            "relative z-10 text-center",
            fit
              ? "shrink-0 px-2 pt-3 pb-1.5 sm:px-4 sm:pt-4"
              : "px-4 pt-6 pb-4 sm:px-8 sm:pt-8",
          )}
        >
          {/* hanging bells row — decorative, like the reference calendar */}
          <div
            aria-hidden
            className={cn(
              "mb-1 flex items-end justify-center gap-8 text-[#D4A373]",
              fit ? "gap-6" : "gap-10 sm:mb-2",
            )}
          >
            <BellMotif className={fit ? "h-4 w-3" : "h-5 w-4"} />
            <BellMotif className={fit ? "h-5 w-3.5" : "h-6 w-5"} />
            <BellMotif className={fit ? "h-4 w-3" : "h-5 w-4"} />
          </div>

          <p
            className={cn(
              "font-display font-semibold tracking-[0.35em] text-[#8B6B4A] uppercase",
              fit ? "text-[9px]" : "text-[10px] sm:text-xs",
            )}
          >
            {title || "Our Calendar"}
          </p>
          <div className="mx-auto mt-1.5 flex items-center justify-center gap-2">
            <span
              aria-hidden
              className="h-px w-8 bg-gradient-to-r from-transparent to-[#D4A373] sm:w-12"
            />
            <DiamondMotif />
            <span
              aria-hidden
              className="h-px w-8 bg-gradient-to-l from-transparent to-[#D4A373] sm:w-12"
            />
          </div>
          <div
            className={cn(
              "mt-2 flex items-center justify-center",
              fit ? "gap-2" : "mt-3 gap-3 sm:gap-5",
            )}
          >
            <NavBtn label="Previous month" onClick={onPrevMonth} compact={fit}>
              <ChevronLeft className={fit ? "size-4" : "size-5"} />
            </NavBtn>
            <AnimatePresence mode="wait">
              <motion.h2
                key={`${year}-${monthIndex}`}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.22 }}
                className={cn(
                  "min-w-0 font-serif tracking-wide text-[#3a2a25] sm:min-w-[10rem]",
                  fit
                    ? "text-lg sm:text-xl"
                    : "text-xl sm:text-3xl md:text-4xl",
                )}
              >
                {monthLabel(year, monthIndex)}
              </motion.h2>
            </AnimatePresence>
            <NavBtn label="Next month" onClick={onNextMonth} compact={fit}>
              <ChevronRight className={fit ? "size-4" : "size-5"} />
            </NavBtn>
          </div>
          {(subtitle || partnerNames) && !fit && (
            <p className="mt-2 text-sm text-[#92786c] italic">
              {partnerNames || subtitle}
            </p>
          )}
          {fit && (partnerNames || subtitle) && (
            <p className="mt-0.5 truncate text-[10px] text-[#92786c] italic">
              {partnerNames || subtitle}
            </p>
          )}
          {togetherLabel && (
            <div
              className={cn(
                "mx-auto mt-2 inline-flex flex-wrap items-center justify-center gap-x-2 gap-y-1 rounded-full border px-3 py-1",
                anniversaryToday
                  ? "border-[#B11226]/35 bg-[#B11226]/10 text-[#B11226]"
                  : "border-[#D4A373]/50 bg-[#fffaf4]/80 text-[#8B6B4A]",
                fit ? "mt-1 px-2 py-0.5 text-[9px]" : "text-xs",
              )}
            >
              <span className="font-semibold tracking-wide">
                Together {togetherLabel}
              </span>
              {anniversaryLine && (
                <>
                  <span aria-hidden className="opacity-40">
                    ·
                  </span>
                  <span>{anniversaryLine}</span>
                </>
              )}
            </div>
          )}
        </header>

        <div
          className={cn(
            "relative z-10 flex min-h-0 flex-col",
            fit
              ? "flex-1 px-1.5 pb-2 sm:px-3 sm:pb-3"
              : "px-2 pb-4 sm:px-5 sm:pb-6",
          )}
        >
          <div className="grid shrink-0 grid-cols-7 gap-px border border-[#D4A373]/55 bg-[#D4A373]/40">
            {weekdays.map((d) => (
              <div
                key={d}
                className={cn(
                  "bg-[#f7efe4] text-center font-semibold tracking-wider text-[#8B6B4A] uppercase",
                  fit
                    ? "py-1 text-[9px] sm:text-[10px]"
                    : "py-2 text-xs sm:text-xs",
                )}
              >
                {fit ? (
                  d.slice(0, 1)
                ) : (
                  <>
                    <span className="sm:hidden">{d.slice(0, 3)}</span>
                    <span className="hidden sm:inline">{d}</span>
                  </>
                )}
              </div>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={`${year}-${monthIndex}-grid`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className={cn(
                "grid grid-cols-7 gap-px border border-t-0 border-[#D4A373]/55 bg-[#D4A373]/35",
                fit && "min-h-0 flex-1 grid-rows-6",
              )}
            >
              {cells.map((cell, i) => (
                <DayCell
                  key={i}
                  cell={cell}
                  fit={fit}
                  interactive={interactive}
                  resolvePhoto={resolvePhoto}
                  onDayClick={onDayClick}
                  onEventClick={onEventClick}
                />
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </OrnateFrame>
    </div>
  );
}

function DayCell({
  cell,
  fit,
  interactive,
  resolvePhoto,
  onDayClick,
  onEventClick,
}: {
  cell: CalendarDayCell;
  fit: boolean;
  interactive: boolean;
  resolvePhoto?: (event: CalendarEvent) => string | null;
  onDayClick?: (dateKey: string) => void;
  onEventClick?: (event: CalendarEvent) => void;
}) {
  if (!cell.inMonth) {
    return (
      <div
        className={cn(
          "relative bg-[#f3e8d8]/70",
          fit
            ? "min-h-0"
            : "min-h-[3.25rem] sm:min-h-[5.75rem] md:min-h-[6.5rem]",
        )}
      >
        {cell.decorative && <DecorativeMotif compact={fit} />}
      </div>
    );
  }

  const dateKey = cell.date ? toDateKey(cell.date) : "";
  const primary = cell.events[0];
  const photo = primary && resolvePhoto ? resolvePhoto(primary) : null;
  const canClickDay = interactive && !!onDayClick;
  const titles = fit ? cell.visibleTitles.slice(0, 1) : cell.visibleTitles;

  return (
    <div
      role={canClickDay ? "button" : undefined}
      tabIndex={canClickDay ? 0 : undefined}
      onClick={() => {
        if (!canClickDay || !dateKey) return;
        onDayClick?.(dateKey);
      }}
      onKeyDown={(e) => {
        if (!canClickDay || !dateKey) return;
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onDayClick?.(dateKey);
        }
      }}
      className={cn(
        "group relative flex flex-col bg-[#fbf6ee] transition-colors",
        fit
          ? "min-h-0 overflow-hidden p-0.5 sm:p-1"
          : "min-h-[3.25rem] p-1 sm:min-h-[5.75rem] sm:p-1.5 md:min-h-[6.5rem]",
        cell.anniversaryHighlight &&
          "bg-[#fff5f0] ring-1 ring-inset ring-[#B11226]/35",
        canClickDay && "cursor-pointer hover:bg-[#f7ebe0]",
        canClickDay && !fit && "min-h-11",
      )}
    >
      <span
        className={cn(
          "font-serif text-[#3a2a25]",
          fit
            ? "text-[9px] leading-none sm:text-[10px]"
            : "text-[11px] leading-tight sm:text-sm",
          cell.anniversaryHighlight && "font-semibold text-[#B11226]",
        )}
      >
        {cell.day}
        {cell.anniversaryHighlight && (
          <span className="ml-0.5 text-[8px] text-[#B11226]" aria-hidden>
            ♥
          </span>
        )}
      </span>

      <div className="mt-0.5 flex min-h-0 flex-1 flex-col gap-0.5 overflow-hidden">
        {titles.map((t, idx) => {
          const ev = cell.events[idx];
          return (
            <button
              key={ev?.id ?? `${t}-${idx}`}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (ev) onEventClick?.(ev);
              }}
              className={cn(
                "line-clamp-2 w-full text-left leading-tight text-[#5c4033]",
                fit ? "text-[8px] sm:text-[9px]" : "text-[9px] sm:text-[10px]",
                onEventClick && "hover:text-[#B11226] hover:underline",
              )}
            >
              {t}
            </button>
          );
        })}
        {!fit && cell.overflow > 0 && cell.events[0] && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onEventClick?.(cell.events[0]!);
            }}
            className="text-[9px] font-medium text-[#B11226] sm:text-[10px]"
          >
            +{cell.overflow} more
          </button>
        )}
        {fit && cell.events.length > 1 && (
          <span className="text-[8px] font-medium text-[#B11226]">
            +{cell.events.length - 1}
          </span>
        )}
      </div>

      {(photo || primary) && (
        <div className="mt-auto flex justify-center pt-0.5">
          {photo && !fit ? (
            // eslint-disable-next-line @next/next/no-img-element -- presigned / blob URLs
            <img
              src={photo}
              alt=""
              className="size-6 rounded-sm object-cover shadow-sm ring-1 ring-[#D4A373]/50 sm:size-8"
            />
          ) : primary ? (
            <span
              aria-hidden
              className={
                fit ? "text-[10px] leading-none" : "text-sm sm:text-base"
              }
              style={{ color: CATEGORY_COLORS[primary.category] }}
            >
              {CATEGORY_GLYPH[primary.category]}
            </span>
          ) : null}
        </div>
      )}
    </div>
  );
}

function DecorativeMotif({ compact }: { compact?: boolean }) {
  const size = compact ? 18 : 28;
  return (
    <div className="pointer-events-none absolute inset-0 grid place-items-center opacity-45">
      <svg
        width={size}
        height={size}
        viewBox="0 0 28 28"
        fill="none"
        aria-hidden
      >
        <circle cx="14" cy="14" r="3" stroke="#D4A373" strokeWidth="1" />
        <path
          d="M14 2v4M14 22v4M2 14h4M22 14h4M5.5 5.5l2.8 2.8M19.7 19.7l2.8 2.8M5.5 22.5l2.8-2.8M19.7 8.3l2.8-2.8"
          stroke="#D4A373"
          strokeWidth="1"
          strokeLinecap="round"
        />
        <circle cx="14" cy="14" r="1.2" fill="#D4A373" opacity="0.5" />
      </svg>
    </div>
  );
}

function OrnateFrame({
  children,
  fit,
}: {
  children: React.ReactNode;
  fit?: boolean;
}) {
  return (
    <div
      className={cn(
        "relative flex flex-col overflow-hidden rounded-sm bg-[#f7efe4] shadow-[0_20px_50px_-28px_rgba(58,42,37,0.45)] ring-1 ring-[#D4A373]/45",
        fit && "h-full min-h-0",
      )}
    >
      {/* parchment wash */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-90"
        style={{
          background:
            "radial-gradient(ellipse 80% 55% at 50% 0%, #fffaf3 0%, transparent 55%), radial-gradient(ellipse 55% 40% at 12% 88%, rgba(177,18,38,0.07) 0%, transparent 55%), radial-gradient(ellipse 55% 40% at 88% 88%, rgba(177,18,38,0.07) 0%, transparent 55%), radial-gradient(ellipse 70% 50% at 80% 100%, #f0dcc8 0%, transparent 50%), linear-gradient(180deg, #fbf6ee 0%, #f3e6d4 100%)",
        }}
      />

      {/* arched top crown */}
      <svg
        aria-hidden
        className="pointer-events-none absolute top-0 left-1/2 z-[1] w-[72%] max-w-md -translate-x-1/2 text-[#D4A373]"
        viewBox="0 0 320 36"
        fill="none"
        preserveAspectRatio="xMidYMin meet"
      >
        <path
          d="M8 34 C40 34 48 8 160 8 C272 8 280 34 312 34"
          stroke="currentColor"
          strokeWidth="1.4"
          opacity="0.85"
        />
        <path
          d="M24 34 C52 34 58 14 160 14 C262 14 268 34 296 34"
          stroke="currentColor"
          strokeWidth="0.8"
          opacity="0.45"
        />
        <circle cx="160" cy="8" r="2.2" fill="currentColor" opacity="0.7" />
      </svg>

      {/* gold borders */}
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute rounded-sm border border-[#D4A373]/60",
          fit ? "inset-1.5" : "inset-2 sm:inset-3",
        )}
      />
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute rounded-sm border border-[#D4A373]/25",
          fit ? "inset-2.5" : "inset-3 sm:inset-4",
        )}
      />

      {/* corner flourishes */}
      <Corner
        className={cn(
          fit ? "top-1.5 left-1.5 size-6" : "top-3 left-3 size-8 sm:size-10",
        )}
      />
      <Corner
        className={cn(
          "rotate-90",
          fit ? "top-1.5 right-1.5 size-6" : "top-3 right-3 size-8 sm:size-10",
        )}
      />
      <Corner
        className={cn(
          "-rotate-90",
          fit
            ? "bottom-1.5 left-1.5 size-6"
            : "bottom-3 left-3 size-8 sm:size-10",
        )}
      />
      <Corner
        className={cn(
          "rotate-180",
          fit
            ? "right-1.5 bottom-1.5 size-6"
            : "right-3 bottom-3 size-8 sm:size-10",
        )}
      />

      {/* lotus accents */}
      <LotusMotif
        className={cn(
          "bottom-2 left-3 text-[#B11226]/35",
          fit ? "size-7" : "size-10 sm:size-12",
        )}
      />
      <LotusMotif
        className={cn(
          "right-3 bottom-2 scale-x-[-1] text-[#B11226]/35",
          fit ? "size-7" : "size-10 sm:size-12",
        )}
      />

      {children}
    </div>
  );
}

function Corner({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      className={cn(
        "pointer-events-none absolute text-[#D4A373] opacity-75",
        className,
      )}
      viewBox="0 0 40 40"
      fill="none"
    >
      <path
        d="M2 22C2 10 10 2 22 2M2 30C2 12 12 2 30 2"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <path
        d="M6 14c4-4 8-6 14-8"
        stroke="currentColor"
        strokeWidth="0.7"
        opacity="0.55"
        strokeLinecap="round"
      />
      <circle cx="4" cy="4" r="1.4" fill="currentColor" opacity="0.55" />
    </svg>
  );
}

function BellMotif({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      className={cn("opacity-80", className)}
      viewBox="0 0 20 28"
      fill="none"
    >
      <line x1="10" y1="0" x2="10" y2="6" stroke="#D4A373" strokeWidth="1" />
      <path
        d="M4 10c0-3.3 2.7-6 6-6s6 2.7 6 6v6c0 1.5 1 2.5 1.5 3H2.5C3 18.5 4 17.5 4 16v-6z"
        fill="#D4A373"
        opacity="0.55"
      />
      <ellipse cx="10" cy="20" rx="5" ry="1.6" fill="#C9A06A" />
      <circle cx="10" cy="23" r="1.3" fill="#B11226" opacity="0.7" />
    </svg>
  );
}

function DiamondMotif() {
  return (
    <svg
      aria-hidden
      width="10"
      height="10"
      viewBox="0 0 10 10"
      className="text-[#D4A373]"
    >
      <path d="M5 0 L10 5 L5 10 L0 5 Z" fill="currentColor" opacity="0.75" />
    </svg>
  );
}

function LotusMotif({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      className={cn("pointer-events-none absolute opacity-70", className)}
      viewBox="0 0 48 40"
      fill="none"
    >
      <path
        d="M24 34 C18 28 10 24 8 18 C12 18 18 20 24 26 C30 20 36 18 40 18 C38 24 30 28 24 34 Z"
        fill="currentColor"
      />
      <path
        d="M24 32 C20 24 16 14 24 6 C32 14 28 24 24 32 Z"
        fill="currentColor"
        opacity="0.85"
      />
      <path
        d="M14 30 C10 24 6 20 4 14 C10 16 16 20 20 26 C18 28 16 29 14 30 Z"
        fill="currentColor"
        opacity="0.55"
      />
      <path
        d="M34 30 C38 24 42 20 44 14 C38 16 32 20 28 26 C30 28 32 29 34 30 Z"
        fill="currentColor"
        opacity="0.55"
      />
    </svg>
  );
}

function NavBtn({
  label,
  onClick,
  children,
  compact,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
  compact?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={cn(
        "grid place-items-center rounded-full text-[#8B6B4A] transition-colors hover:bg-[#D4A373]/20 hover:text-[#3a2a25]",
        compact ? "size-8" : "size-11",
      )}
    >
      {children}
    </button>
  );
}
