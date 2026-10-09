"use client";

import { useEffect, useMemo, useState } from "react";

import { formatTarget } from "@/features/countdown/lib/time";

import {
  isReasonOpen,
  nextUnlockRemaining,
  partitionReasons,
} from "../../lib/unlock";
import { useBuilderStore } from "../../store/builder.store";

const WARM_SURFACE =
  "linear-gradient(165deg, #fdf6ee 0%, #f3e4d4 45%, #ead7c4 100%)";

function formatRemaining(r: {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  reached: boolean;
}): string {
  if (r.reached) return "all open";
  const parts: string[] = [];
  if (r.days > 0) parts.push(`${r.days}d`);
  if (r.hours > 0 || r.days > 0) parts.push(`${r.hours}h`);
  parts.push(`${r.minutes}m`);
  parts.push(`${String(r.seconds).padStart(2, "0")}s`);
  return parts.join(" ");
}

/**
 * Lightweight builder gallery — sealed vs open tiles + a time scrubber.
 * Not the full recipient experience (Phase C).
 */
export function ReasonsPreview() {
  const doc = useBuilderStore((s) => s.doc);
  const previewOffsetMs = useBuilderStore((s) => s.previewOffsetMs);
  const setPreviewOffsetMs = useBuilderStore((s) => s.setPreviewOffsetMs);

  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => setTick((t) => t + 1), 1000);
    return () => window.clearInterval(id);
  }, []);

  // eslint-disable-next-line react-hooks/purity -- tick re-renders this countdown each second
  const now = Date.now() + previewOffsetMs;
  // tick forces countdown re-render each second
  void tick;

  const spanMs = useMemo(() => {
    const count = Math.max(doc.reasons.length, 1);
    const step = doc.intervalHours * 60 * 60 * 1000;
    // Cover the full schedule window (last unlock + a little padding).
    return Math.max(step * count, 60 * 60 * 1000);
  }, [doc.intervalHours, doc.reasons.length]);

  const { open, complete } = partitionReasons(doc.reasons, now);
  const { reason: next, remaining } = nextUnlockRemaining(doc.reasons, now);
  const openIds = useMemo(() => new Set(open.map((r) => r.id)), [open]);

  const scrubLabel = (() => {
    if (previewOffsetMs <= 0) return "now";
    const hours = previewOffsetMs / (60 * 60 * 1000);
    if (hours < 1) return `+${Math.round(previewOffsetMs / 60000)}m`;
    return `+${hours.toFixed(1)}h`;
  })();

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ background: WARM_SURFACE }}
      />
      {/* soft gold wash */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[radial-gradient(ellipse_at_top,_rgba(212,163,115,0.28),_transparent_70%)]"
      />

      <div className="relative flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-4 py-6 sm:px-8 sm:py-8">
        <header className="mx-auto w-full max-w-2xl text-center">
          <p className="font-hand text-sm tracking-wide text-[#c75b39]">
            {doc.occasion === "girlfriend-day"
              ? "Girlfriend Day · all day long"
              : "Hourglass letters"}
          </p>
          <h2 className="font-display mt-1 text-2xl text-[#3a2a25] sm:text-3xl">
            {doc.title || "24 Reasons"}
          </h2>
          {doc.intro ? (
            <p className="mx-auto mt-2 max-w-md text-sm text-[#7a6258]">
              {doc.intro}
            </p>
          ) : null}
          <p className="mt-3 text-xs font-medium tracking-wide text-[#92786c] uppercase">
            {complete
              ? "All reasons open"
              : next
                ? `Next unlock in ${formatRemaining(remaining)}`
                : "Add reasons to preview unlocks"}
          </p>
        </header>

        {doc.reasons.length === 0 ? (
          <p className="mx-auto max-w-sm rounded-xl border border-dashed border-[#e3d2c5] bg-white/50 px-4 py-10 text-center text-sm text-[#92786c]">
            Load the starter pack or add a reason to see the sealed gallery.
          </p>
        ) : (
          <ul className="mx-auto grid w-full max-w-2xl grid-cols-4 gap-2 sm:grid-cols-6 sm:gap-2.5">
            {doc.reasons.map((r) => {
              const openTile = openIds.has(r.id) || isReasonOpen(r, now);
              return (
                <li
                  key={r.id}
                  className={[
                    "aspect-[3/4] rounded-lg border px-1.5 py-2 text-center transition-colors",
                    openTile
                      ? "border-[#e8d5c4] bg-[#fffaf4] shadow-sm"
                      : "border-[#d4a373]/35 bg-gradient-to-b from-[#f5e6d6] to-[#e8d4bc]",
                  ].join(" ")}
                >
                  <span
                    className={[
                      "font-hand block text-[0.65rem] tracking-wide",
                      openTile ? "text-[#c75b39]" : "text-[#8a6a4a]",
                    ].join(" ")}
                  >
                    {String(r.n).padStart(2, "0")}
                  </span>
                  {openTile ? (
                    <p className="mt-1 line-clamp-3 text-[0.6rem] leading-snug text-[#5a433a]">
                      {r.message.trim() || "···"}
                    </p>
                  ) : (
                    <p className="mt-2 text-[0.55rem] leading-tight text-[#8a6a4a]/80">
                      {r.teaser.trim() ||
                        (r.unlockAt ? formatTarget(r.unlockAt) : "sealed")}
                    </p>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Time scrubber */}
      <div className="relative shrink-0 border-t border-[#e8d5c4]/80 bg-[#fffaf4]/90 px-4 py-3 backdrop-blur-sm sm:px-6">
        <div className="mx-auto flex w-full max-w-2xl flex-col gap-1.5">
          <div className="flex items-center justify-between text-[0.7rem] text-[#92786c]">
            <span>Preview time</span>
            <span className="font-medium text-[#c75b39]">{scrubLabel}</span>
          </div>
          <input
            type="range"
            min={0}
            max={spanMs}
            step={60_000}
            value={Math.min(previewOffsetMs, spanMs)}
            onChange={(e) => setPreviewOffsetMs(Number(e.target.value))}
            className="w-full accent-[#c75b39]"
            aria-label="Scrub preview time forward from now"
          />
          <div className="flex justify-between text-[0.65rem] text-[#b29a89]">
            <span>Now</span>
            <button
              type="button"
              onClick={() => setPreviewOffsetMs(0)}
              className="underline-offset-2 hover:text-[#c75b39] hover:underline"
            >
              Reset
            </button>
            <span>+schedule</span>
          </div>
        </div>
      </div>
    </div>
  );
}
