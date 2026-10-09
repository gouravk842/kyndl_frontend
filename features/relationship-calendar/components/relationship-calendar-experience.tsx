"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

import { CATEGORY_GLYPH, CATEGORY_LABELS, SAMPLE_DOC } from "../config";
import { initialViewMonth, parseDateKey, shiftMonth } from "../lib/calendar";
import type { CalendarEvent, RelationshipCalendarDoc } from "../types";
import { CalendarGrid } from "./calendar-grid";

/**
 * Marketing / inline embed preview — sample August memories on the ornate grid.
 */
export function RelationshipCalendarExperience({
  doc = SAMPLE_DOC,
  assets = {},
  className,
  fit = false,
}: {
  doc?: RelationshipCalendarDoc;
  assets?: Record<string, string>;
  className?: string;
  /** Fill a fixed parent without scrolling (product-page hero frame). */
  fit?: boolean;
}) {
  // Marketing sample is authored for August 2026 — keep the embed there.
  const start =
    doc === SAMPLE_DOC
      ? { year: 2026, monthIndex: 7 }
      : initialViewMonth(doc.events);
  const [year, setYear] = useState(start.year);
  const [monthIndex, setMonthIndex] = useState(start.monthIndex);
  const [detail, setDetail] = useState<CalendarEvent | null>(null);

  const resolvePhoto = (event: CalendarEvent) =>
    event.photo ? (assets[event.photo.fileId] ?? null) : null;

  return (
    <div className={cn(fit && "flex h-full min-h-0 flex-col", className)}>
      <CalendarGrid
        year={year}
        monthIndex={monthIndex}
        events={doc.events}
        weekStartsOn={doc.weekStartsOn}
        title={doc.title}
        subtitle={doc.subtitle}
        partnerNames={doc.partnerNames}
        togetherSince={doc.togetherSince}
        resolvePhoto={resolvePhoto}
        variant={fit ? "fit" : "default"}
        onPrevMonth={() => {
          const n = shiftMonth(year, monthIndex, -1);
          setYear(n.year);
          setMonthIndex(n.monthIndex);
        }}
        onNextMonth={() => {
          const n = shiftMonth(year, monthIndex, 1);
          setYear(n.year);
          setMonthIndex(n.monthIndex);
        }}
        onEventClick={setDetail}
      />
      <MemoryDetailSheet
        event={detail}
        photoUrl={detail ? resolvePhoto(detail) : null}
        onClose={() => setDetail(null)}
      />
    </div>
  );
}

/**
 * Audience-facing viewer for a published creation.
 */
export function RelationshipCalendarPublicViewer({
  content,
  assets,
}: {
  content: RelationshipCalendarDoc;
  assets: Record<string, string>;
}) {
  const start = initialViewMonth(content.events);
  const [year, setYear] = useState(start.year);
  const [monthIndex, setMonthIndex] = useState(start.monthIndex);
  const [detail, setDetail] = useState<CalendarEvent | null>(null);

  useEffect(() => {
    const next = initialViewMonth(content.events);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- open the month that holds the memories
    setYear(next.year);

    setMonthIndex(next.monthIndex);
  }, [content.events]);

  const resolvePhoto = (event: CalendarEvent) =>
    event.photo ? (assets[event.photo.fileId] ?? null) : null;

  return (
    <div
      className="relative min-h-full w-full overflow-y-auto"
      style={{
        background:
          "radial-gradient(ellipse 80% 50% at 50% 0%, #fffaf3 0%, transparent 55%), linear-gradient(165deg, #f7efe4 0%, #ead9c4 55%, #e0c9ae 100%)",
      }}
    >
      {content.events.length === 0 && (
        <p className="px-4 pt-8 text-center text-sm text-[#92786c]">
          No memories on this calendar yet.
        </p>
      )}
      <CalendarGrid
        year={year}
        monthIndex={monthIndex}
        events={content.events}
        weekStartsOn={content.weekStartsOn}
        title={content.title}
        subtitle={content.subtitle}
        partnerNames={content.partnerNames}
        togetherSince={content.togetherSince}
        resolvePhoto={resolvePhoto}
        onPrevMonth={() => {
          const n = shiftMonth(year, monthIndex, -1);
          setYear(n.year);
          setMonthIndex(n.monthIndex);
        }}
        onNextMonth={() => {
          const n = shiftMonth(year, monthIndex, 1);
          setYear(n.year);
          setMonthIndex(n.monthIndex);
        }}
        onEventClick={setDetail}
      />
      <MemoryDetailSheet
        event={detail}
        photoUrl={detail ? resolvePhoto(detail) : null}
        onClose={() => setDetail(null)}
      />
    </div>
  );
}

function MemoryDetailSheet({
  event,
  photoUrl,
  onClose,
}: {
  event: CalendarEvent | null;
  photoUrl: string | null;
  onClose: () => void;
}) {
  const dateLabel = event
    ? (() => {
        const d = parseDateKey(event.date);
        if (!d) return event.date;
        return d.toLocaleDateString(undefined, {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        });
      })()
    : "";

  return (
    <AnimatePresence>
      {event && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button
            type="button"
            aria-label="Close"
            className="absolute inset-0 bg-[#3a2a25]/40 backdrop-blur-[2px]"
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-label={event.title}
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 24, opacity: 0 }}
            transition={{ type: "spring", stiffness: 380, damping: 32 }}
            className="relative z-10 w-full max-w-md overflow-hidden rounded-t-2xl bg-[#fffaf4] shadow-2xl sm:rounded-2xl"
          >
            {photoUrl && (
              // eslint-disable-next-line @next/next/no-img-element -- presigned URL
              <img src={photoUrl} alt="" className="h-48 w-full object-cover" />
            )}
            <div className="px-5 py-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs tracking-wide text-[#92786c] uppercase">
                    {CATEGORY_GLYPH[event.category]}{" "}
                    {CATEGORY_LABELS[event.category]}
                    {event.recursYearly ? " · every year" : ""}
                  </p>
                  <h3 className="mt-1 font-serif text-2xl text-[#3a2a25]">
                    {event.title}
                  </h3>
                  <p className="mt-1 text-sm text-[#8B6B4A]">{dateLabel}</p>
                </div>
                <button
                  type="button"
                  aria-label="Close"
                  onClick={onClose}
                  className="grid size-8 shrink-0 place-items-center rounded-full text-[#92786c] hover:bg-[#fbeee6]"
                >
                  <X className="size-4" />
                </button>
              </div>
              {event.note ? (
                <p className="mt-4 text-sm leading-relaxed whitespace-pre-wrap text-[#5c4033]">
                  {event.note}
                </p>
              ) : null}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
