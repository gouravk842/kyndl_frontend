"use client";

import type { Tag,TreasureTheme } from "../config";

/**
 * The engraved keepsake plate — the piece that makes a treasure read as a *gift
 * object* rather than an album. A brushed-metal plate carries the engraved
 * `title` ("Made of Happy Memories"), the occasion, and a From → To line.
 *
 * `compact` renders the small nameplate that sits on the closed box (title
 * only); the full form is shown once, at the end of the opened treasure.
 */
export function KeepsakeTag({
  tag,
  senderName,
  recipientName,
  theme,
  compact = false,
}: {
  tag: Tag;
  senderName: string;
  recipientName: string;
  theme: TreasureTheme;
  compact?: boolean;
}) {
  const title = tag.title.trim() || "Made of Happy Memories";
  const from = senderName.trim();
  const to = recipientName.trim();

  return (
    <div
      className={[
        "relative overflow-hidden rounded-md text-center",
        compact ? "px-4 py-2" : "px-7 py-5",
      ].join(" ")}
      style={{
        background: theme.plate,
        color: theme.plateInk,
        boxShadow: `inset 0 1px 0 rgba(255,255,255,0.5), inset 0 -2px 4px rgba(0,0,0,0.18), 0 6px 16px -8px rgba(0,0,0,0.4)`,
        border: `1px solid ${theme.metal}`,
      }}
    >
      {/* brushed-metal sheen */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-30 mix-blend-overlay"
        style={{
          backgroundImage:
            "repeating-linear-gradient(115deg, rgba(255,255,255,0.5) 0 1px, transparent 1px 3px)",
        }}
      />
      <p
        className={[
          "font-display relative tracking-wide",
          compact ? "text-sm font-semibold" : "text-xl font-semibold sm:text-2xl",
        ].join(" ")}
        style={{ textShadow: "0 1px 0 rgba(255,255,255,0.35)" }}
      >
        {title}
      </p>

      {!compact && (
        <>
          {tag.occasion.trim() && (
            <p className="relative mt-1 text-xs font-medium tracking-[0.18em] uppercase opacity-80">
              {tag.occasion}
            </p>
          )}
          {(from || to) && (
            <div
              className="relative mx-auto mt-3 flex items-center justify-center gap-2 text-xs"
              style={{ color: theme.plateInk }}
            >
              <span
                aria-hidden
                className="h-px w-6"
                style={{ background: theme.plateInk, opacity: 0.4 }}
              />
              <span className="font-medium tracking-wide">
                {from && `From ${from}`}
                {from && to && " · "}
                {to && `For ${to}`}
              </span>
              <span
                aria-hidden
                className="h-px w-6"
                style={{ background: theme.plateInk, opacity: 0.4 }}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
