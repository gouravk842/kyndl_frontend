"use client";

import { forwardRef, useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

import type {
  MemoryEntry,
  MemoryPage as PageData,
  ResolveAuthor,
  ResolvePhoto,
} from "../types";

// Shared design canvas with the scrapbook, so album leaves and any future mixed
// books line up. Everything is authored against these units and scaled to fit.
export const DESIGN_W = 460;
export const DESIGN_H = 620;

// ── Decorative line art (faint, evokes the reference's ferns + map) ──

function Fern({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 80 160"
      aria-hidden
      className={cn("pointer-events-none absolute text-[#b59a6a]", className)}
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="round"
    >
      <path d="M40 158 C40 120 40 70 40 6" />
      {Array.from({ length: 9 }).map((_, i) => {
        const y = 18 + i * 15;
        const len = 30 - i * 2.4;
        return (
          <g key={i}>
            <path
              d={`M40 ${y} C${40 - len / 2} ${y - 4}, ${40 - len} ${y - 2}, ${40 - len} ${y + 8}`}
            />
            <path
              d={`M40 ${y} C${40 + len / 2} ${y - 4}, ${40 + len} ${y - 2}, ${40 + len} ${y + 8}`}
            />
          </g>
        );
      })}
    </svg>
  );
}

/** Faint geometric ornament drawn across the whole leaf, behind the content:
 *  a double-line frame, art-deco corner accents, small diamonds + circles, and
 *  a dotted divider down the bound edge. Authored in design units (460×620). */
function GeoDecor({ side }: { side: "left" | "right" }) {
  const spineX = side === "left" ? 436 : 24; // dotted line hugs the gutter edge
  const corners: [number, number][] = [
    [22, 22],
    [438, 22],
    [22, 598],
    [438, 598],
  ];
  return (
    <svg
      viewBox="0 0 460 620"
      aria-hidden
      preserveAspectRatio="none"
      className="pointer-events-none absolute inset-0 h-full w-full"
      fill="none"
      stroke="#b89a62"
    >
      {/* double-line frame */}
      <rect
        x="22"
        y="22"
        width="416"
        height="576"
        strokeWidth="1"
        opacity="0.35"
      />
      <rect
        x="27"
        y="27"
        width="406"
        height="566"
        strokeWidth="0.6"
        opacity="0.25"
      />

      {/* art-deco corner accents + diamonds */}
      {corners.map(([cx, cy], i) => {
        const sx = cx < 230 ? 1 : -1;
        const sy = cy < 310 ? 1 : -1;
        return (
          <g key={i} opacity="0.4">
            <path
              d={`M${cx + sx * 14} ${cy} L${cx} ${cy} L${cx} ${cy + sy * 14}`}
              strokeWidth="1"
            />
            <rect
              x={cx - 3}
              y={cy - 3}
              width="6"
              height="6"
              strokeWidth="0.8"
              transform={`rotate(45 ${cx} ${cy})`}
            />
          </g>
        );
      })}

      {/* small geometric flourishes */}
      <g opacity="0.3">
        <circle cx="230" cy="46" r="5" strokeWidth="0.8" />
        <circle cx="230" cy="46" r="2" strokeWidth="0.8" />
        <path d="M214 46 H224 M236 46 H246" strokeWidth="0.7" />
        <path d="M230 568 l6 6 -6 6 -6 -6 z" strokeWidth="0.8" />
      </g>

      {/* dotted divider down the bound edge */}
      <line
        x1={spineX}
        y1="70"
        x2={spineX}
        y2="550"
        strokeWidth="1"
        strokeDasharray="1 7"
        strokeLinecap="round"
        opacity="0.3"
      />
    </svg>
  );
}

function Globe({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      aria-hidden
      className={cn("pointer-events-none absolute text-[#a98c5e]", className)}
      fill="none"
      stroke="currentColor"
      strokeWidth="0.7"
    >
      <circle cx="50" cy="50" r="44" />
      <ellipse cx="50" cy="50" rx="44" ry="17" />
      <ellipse cx="50" cy="50" rx="44" ry="32" />
      <ellipse cx="50" cy="50" rx="17" ry="44" />
      <ellipse cx="50" cy="50" rx="32" ry="44" />
      <line x1="6" y1="50" x2="94" y2="50" />
    </svg>
  );
}

/** A small pin glyph for the location line. */
function Pin({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden
      className={cn("inline-block", className)}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path d="M12 21s7-6.3 7-11a7 7 0 1 0-14 0c0 4.7 7 11 7 11Z" />
      <circle cx="12" cy="10" r="2.4" />
    </svg>
  );
}

// ── Photo + text blocks ─────────────────────────────────────────────

/** A matted, gold-lined photo print, with a graceful empty state. */
function FramedPhoto({
  url,
  className,
}: {
  url: string | null;
  className?: string;
}) {
  return (
    <figure
      className={cn(
        "bg-[#fdfaf1] p-2 shadow-[0_10px_24px_-14px_rgba(60,40,25,0.55)]",
        className,
      )}
    >
      <div className="border border-[#c2a266] p-[3px]">
        <div className="relative aspect-[4/3] overflow-hidden bg-[#e9dfc9]">
          {url ? (
            // eslint-disable-next-line @next/next/no-img-element -- local user-supplied / presigned asset
            <img
              src={url}
              alt=""
              draggable={false}
              // `contain` so nothing gets cropped — portrait docs (ID cards,
              // marksheets) and landscape photos both sit fully inside the mat.
              className="h-full w-full object-contain"
            />
          ) : (
            <span className="absolute inset-0 grid place-items-center text-[#b29a6f]">
              <svg
                viewBox="0 0 24 24"
                className="size-7"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.3"
              >
                <rect x="3" y="5" width="18" height="14" rx="2" />
                <circle cx="9" cy="10" r="1.6" />
                <path d="m4 17 5-4 4 3 3-2 4 3" />
              </svg>
            </span>
          )}
        </div>
      </div>
    </figure>
  );
}

type TextVariant = "default" | "feature";

/** Script title + location line. "feature" scales everything up for a memory
 *  that owns the whole leaf. */
function EntryHeader({
  entry,
  align = "left",
  variant = "default",
}: {
  entry: MemoryEntry;
  align?: "left" | "center";
  variant?: TextVariant;
}) {
  if (!entry.title && !entry.caption) return null;
  const feature = variant === "feature";
  return (
    <div className={cn("min-w-0", align === "center" && "text-center")}>
      {entry.title && (
        <h3
          className={cn(
            "font-cursive leading-[1.05] break-words text-[#4a3526] line-clamp-2",
            feature ? "text-[3.1rem]" : "text-[2.5rem]",
          )}
        >
          {entry.title}
        </h3>
      )}
      {entry.caption && (
        <p
          className={cn(
            "mt-1 flex items-center gap-1.5 font-cursive break-words text-[#7c5a3a]",
            feature ? "text-[1.75rem]" : "text-2xl",
            align === "center" && "justify-center",
          )}
        >
          <Pin className="size-4 shrink-0 text-[#b08a4f]" />
          <span className="line-clamp-1 min-w-0">{entry.caption}</span>
        </p>
      )}
    </div>
  );
}

/** Serif description. Clamped in the tight paired layouts; free-flowing on a
 *  feature leaf, where it wraps around the image and runs full-width below it. */
function EntryBody({
  entry,
  variant = "default",
}: {
  entry: MemoryEntry;
  variant?: TextVariant;
}) {
  if (!entry.body) return null;
  const feature = variant === "feature";
  return (
    <p
      className={cn(
        "font-serif break-words text-[#5b4836]",
        feature
          ? "mt-3 text-[15.5px] leading-[1.75]"
          : "mt-2.5 text-[14px] leading-relaxed line-clamp-[7]",
      )}
    >
      {entry.body}
    </p>
  );
}

/** "— who added this memory", shown under the entry. */
function AuthorLine({
  name,
  className,
}: {
  name: string | null;
  className?: string;
}) {
  if (!name) return null;
  return (
    <p
      className={cn(
        "mt-2 font-serif text-[11px] tracking-wide break-words text-[#a98c5e] italic",
        className,
      )}
    >
      — {name}
    </p>
  );
}

/** Header + description together, for the paired/compact layouts. */
function EntryText({
  entry,
  align = "left",
  authorName = null,
}: {
  entry: MemoryEntry;
  align?: "left" | "center";
  authorName?: string | null;
}) {
  if (!entry.title && !entry.caption && !entry.body) return null;
  return (
    <div className={cn("min-w-0", align === "center" && "text-center")}>
      <EntryHeader entry={entry} align={align} />
      <EntryBody entry={entry} />
      <AuthorLine name={authorName} />
    </div>
  );
}

/** Arranges a page's entries according to its layout. */
function PageBody({
  page,
  resolvePhoto,
  resolveAuthor,
}: {
  page: PageData;
  resolvePhoto: ResolvePhoto;
  resolveAuthor: ResolveAuthor;
}) {
  const entries = page.entries;

  if (page.layout === "feature") {
    const entry = entries[0];
    if (!entry) return null;
    // The image tucks into the top corner; the title, location and write-up all
    // flow alongside it (so there's no empty band above the photo) and then run
    // full-width once the text passes the frame's bottom edge.
    return (
      <div className="flex h-full flex-col overflow-hidden px-12 py-9">
        {/* Auto margins center the block while it fits, then shrink to zero as
            the write-up grows — so it eases up to the top and spills downward,
            never clipping the title. */}
        <div className="my-auto">
          <FramedPhoto
            url={resolvePhoto(entry.photo?.fileId)}
            className="float-left mr-6 mb-3 w-[46%]"
          />
          <EntryHeader entry={entry} variant="feature" />
          <EntryBody entry={entry} variant="feature" />
          <AuthorLine
            name={resolveAuthor(entry.authorId)}
            className="text-[12.5px]"
          />
        </div>
      </div>
    );
  }

  if (page.layout === "single") {
    const entry = entries[0];
    if (!entry) return null;
    return (
      <div className="grid h-full grid-cols-[42%_1fr] items-center gap-6 px-12">
        <FramedPhoto url={resolvePhoto(entry.photo?.fileId)} />
        <EntryText entry={entry} authorName={resolveAuthor(entry.authorId)} />
      </div>
    );
  }

  // "duo" / "stack" — two photo+text rows, photo side alternating like the spread.
  const tilt = page.layout === "stack";
  return (
    <div className="flex h-full flex-col justify-evenly gap-6 px-11 py-8">
      {entries.slice(0, 2).map((entry, i) => {
        const photoRight = i % 2 === 1;
        const photo = (
          <FramedPhoto
            url={resolvePhoto(entry.photo?.fileId)}
            className={cn(tilt && (photoRight ? "rotate-2" : "-rotate-2"))}
          />
        );
        return (
          <div
            key={entry.id}
            className="grid grid-cols-[40%_1fr] items-center gap-5"
          >
            {photoRight ? (
              <>
                <EntryText
                  entry={entry}
                  authorName={resolveAuthor(entry.authorId)}
                />
                {photo}
              </>
            ) : (
              <>
                {photo}
                <EntryText
                  entry={entry}
                  authorName={resolveAuthor(entry.authorId)}
                />
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}

type MemoryPageProps = {
  page: PageData;
  pageNumber: number;
  /** Which gutter edge to shade so the leaf feels bound. */
  side: "left" | "right";
  resolvePhoto: ResolvePhoto;
  resolveAuthor: ResolveAuthor;
};

/**
 * One album leaf — an elegant cream page with gold-framed prints, formal script
 * headings, a location line, and faint botanical/map line art, all inside a
 * single scaled design box. Forwards its root node so react-pageflip can drive
 * the flip.
 */
export const MemoryPage = forwardRef<HTMLDivElement, MemoryPageProps>(
  function MemoryPage(
    { page, pageNumber, side, resolvePhoto, resolveAuthor },
    ref,
  ) {
    const fitRef = useRef<HTMLDivElement>(null);
    const [scale, setScale] = useState(0);
    const theme = page.theme ?? "paper";

    useEffect(() => {
      const el = fitRef.current;
      if (!el) return;
      const update = () => setScale(el.clientWidth / DESIGN_W);
      update();
      const ro = new ResizeObserver(update);
      ro.observe(el);
      return () => ro.disconnect();
    }, []);

    const desk = theme === "desk";

    return (
      <div
        ref={ref}
        className={cn(
          "relative h-full w-full overflow-hidden",
          desk ? "kyndl-mp-desk" : "kyndl-mp-leaf kyndl-mp-map",
        )}
      >
        <div ref={fitRef} className="absolute inset-0">
          {scale > 0 && (
            <div
              className="relative"
              style={{
                width: DESIGN_W,
                height: DESIGN_H,
                transformOrigin: "top left",
                transform: `scale(${scale})`,
              }}
            >
              {/* faint decorative line art (skipped on the dark desk theme) */}
              {!desk && (
                <>
                  <GeoDecor side={side} />
                  <Globe className="top-9 right-10 h-14 w-14 opacity-25" />
                  <Fern className="-bottom-2 -left-3 h-40 w-20 -rotate-12 opacity-25" />
                  <Fern className="top-3 right-3 h-28 w-16 rotate-[150deg] opacity-20" />
                </>
              )}

              <div className="relative z-[2] h-full">
                <PageBody
                  page={page}
                  resolvePhoto={resolvePhoto}
                  resolveAuthor={resolveAuthor}
                />
              </div>

              {/* page number */}
              <span
                className={cn(
                  "absolute bottom-4 left-1/2 z-[4] -translate-x-1/2 font-serif text-xs",
                  desk ? "text-[#e8d6b8]/80" : "text-[#9a7d52]",
                )}
              >
                {pageNumber}
              </span>
            </div>
          )}
        </div>

        {/* bound-edge shadow */}
        <span
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-0 z-[6]",
            side === "left"
              ? "kyndl-page-gutter-right"
              : "kyndl-page-gutter-left",
          )}
        />
      </div>
    );
  },
);
