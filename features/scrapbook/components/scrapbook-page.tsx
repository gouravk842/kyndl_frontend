"use client";

import type { CSSProperties } from "react";
import { forwardRef, useEffect, useMemo, useRef, useState } from "react";

import { cn } from "@/lib/utils";

import { bodyToHtml } from "../editor/render";
import type { ScrapbookPage as PageData } from "../types";
import { renderElement } from "./render-element";

// Fixed design canvas. Everything on a leaf — ruling, header, writing surface
// and placed elements — is authored against these dimensions and the whole
// layer is scaled to the rendered leaf size, so it reads identically at any
// size (full book or a tiny gallery thumbnail) and never overflows.
export const DESIGN_W = 460;
export const DESIGN_H = 620;

/** CSS class for a page's surface ruling, or null when plain. */
export function rulingClass(paper: PageData["paper"]): string | null {
  switch (paper) {
    case "ruled":
      return "kyndl-ruled";
    case "dotted":
      return "kyndl-dotted";
    case "grid":
      return "kyndl-grid";
    default:
      return null;
  }
}

/** Writing-surface box (in design units) — reserves room under the header. */
export function bodyBoxStyle(hasHeader: boolean): CSSProperties {
  return { top: hasHeader ? 96 : 44, left: 40, right: 40, bottom: 56 };
}

type ScrapbookPageProps = {
  page: PageData;
  /** Page number shown at the foot (1-based interior index). */
  pageNumber: number;
  /** Which gutter edge to shade so the leaf feels bound. */
  side: "left" | "right";
};

/**
 * One paper leaf. Renders the ruled writing surface and the hand-placed
 * elements over an aged-paper surface with a bound-gutter vignette, all inside a
 * single scaled design box. Forwards its root node so react-pageflip can drive
 * the flip.
 */
export const ScrapbookPage = forwardRef<HTMLDivElement, ScrapbookPageProps>(
  function ScrapbookPage({ page, pageNumber, side }, ref) {
    const fitRef = useRef<HTMLDivElement>(null);
    const [scale, setScale] = useState(0);
    const bodyHtml = useMemo(() => bodyToHtml(page.body), [page.body]);

    useEffect(() => {
      const el = fitRef.current;
      if (!el) return;
      const update = () => setScale(el.clientWidth / DESIGN_W);
      update();
      const ro = new ResizeObserver(update);
      ro.observe(el);
      return () => ro.disconnect();
    }, []);

    const hasHeader = !!(page.eyebrow || page.heading);
    const ruling = rulingClass(page.paper);

    return (
      <div
        ref={ref}
        className="kyndl-paper relative h-full w-full overflow-hidden"
        style={
          page.background
            ? { backgroundColor: page.background, backgroundImage: "none" }
            : undefined
        }
      >
        {/* measured fit box — fills the leaf */}
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
              {/* surface ruling */}
              {ruling && (
                <span
                  aria-hidden
                  className={cn("pointer-events-none absolute inset-0", ruling)}
                />
              )}

              {/* chapter header */}
              {hasHeader && (
                <header className="absolute top-[5%] left-[8%] z-[2]">
                  {page.eyebrow && (
                    <p className="font-hand text-base tracking-wide text-[#c08552]">
                      {page.eyebrow}
                    </p>
                  )}
                  {page.heading && (
                    <h3 className="font-display text-2xl text-[#3a2a25]">
                      {page.heading}
                    </h3>
                  )}
                </header>
              )}

              {/* rich-text writing surface (read-only) */}
              {bodyHtml && (
                <div
                  className="kyndl-page-prose pointer-events-none absolute z-[1] overflow-hidden"
                  style={bodyBoxStyle(hasHeader)}
                  dangerouslySetInnerHTML={{ __html: bodyHtml }}
                />
              )}

              {/* placed elements — float over the text */}
              {page.elements.map((el) => (
                <div
                  key={el.id}
                  className="absolute z-[3]"
                  style={{
                    left: `${el.x}%`,
                    top: `${el.y}%`,
                    width:
                      el.kind === "photo" && el.width
                        ? `${el.width}%`
                        : undefined,
                    zIndex: (el.z ?? 1) + 3,
                    transform: `rotate(${el.rotate ?? 0}deg) scale(${el.scale ?? 1})`,
                    transformOrigin: "top left",
                  }}
                >
                  {renderElement(el)}
                </div>
              ))}

              {/* page number */}
              <span className="absolute bottom-3 left-1/2 z-[4] -translate-x-1/2 font-hand text-sm text-[#b29a89]">
                {pageNumber}
              </span>
            </div>
          )}
        </div>

        {/* paper grain — subtle, above the content */}
        <span
          aria-hidden
          className="kyndl-paper-grain pointer-events-none absolute inset-0 z-[5]"
        />
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
