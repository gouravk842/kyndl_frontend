"use client";

import { forwardRef, useState } from "react";

import { cn } from "@/lib/utils";

import { AssetSlot } from "./elements/asset-slot";

type BookCoverProps = {
  variant: "front" | "back";
  title?: string;
  subtitle?: string;
  dedication?: string;
  coverPhoto?: string;
  /** Base colour for the board; a leather-like gradient is derived from it. */
  coverColor?: string;
  /** When false, omit the hard-page marker so it flips as a soft page. */
  hard?: boolean;
  /** Tapping the back cover closes the whole book. */
  onClose?: () => void;
};

/** Deep maroon — matches the original hardcoded board. */
const DEFAULT_COVER_COLOR = "#5e1722";

/** Build a leather-board gradient from a single base colour. */
function coverGradient(base: string) {
  return (
    `linear-gradient(135deg, ` +
    `color-mix(in srgb, ${base} 82%, white) 0%, ` +
    `${base} 45%, ` +
    `color-mix(in srgb, ${base} 78%, black) 100%)`
  );
}

/**
 * Hardbound cover board. The front shows the embossed title, a cover-photo
 * inset, and a subtle hover lift; the back is a plain board with a closing
 * line. By default a hard page (`data-density="hard"`); pass `hard={false}` to
 * flip it like a normal soft page (used when it lives inside the spread).
 */
export const BookCover = forwardRef<HTMLDivElement, BookCoverProps>(
  function BookCover(
    {
      variant,
      title,
      subtitle,
      dedication,
      coverPhoto,
      coverColor,
      hard = true,
      onClose,
    },
    ref,
  ) {
    const [photoFailed, setPhotoFailed] = useState(false);
    const isFront = variant === "front";
    const showPhoto = coverPhoto && !photoFailed;

    return (
      <div
        ref={ref}
        data-density={hard ? "hard" : undefined}
        className="kyndl-cover-board relative h-full w-full overflow-hidden"
        style={{
          background: coverGradient(coverColor || DEFAULT_COVER_COLOR),
        }}
      >
        {/* leather grain */}
        <span
          aria-hidden
          className="kyndl-grain pointer-events-none absolute inset-0 opacity-60 mix-blend-overlay"
        />
        {/* gilt inner frame */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-5 rounded-[4px] border border-[#d4a373]/50"
        />

        {isFront ? (
          <div className="group relative flex h-full flex-col items-center justify-center px-8 text-center">
            <p className="kyndl-emboss font-hand text-lg tracking-wide text-[#e8c79b]">
              a scrapbook of
            </p>
            <h2 className="kyndl-emboss mt-1 font-display text-4xl leading-tight text-[#f5e9e2] sm:text-5xl">
              {title ?? "Our Story"}
            </h2>
            {subtitle && (
              <p className="kyndl-emboss mt-3 max-w-xs font-cursive text-xl text-[#e8c79b]">
                {subtitle}
              </p>
            )}

            <div className="mt-6 h-32 w-32 rotate-[-3deg] rounded-[3px] bg-[#f5e9e2] p-1.5 shadow-lg transition-transform duration-500 group-hover:-translate-y-1 group-hover:rotate-[-1deg]">
              <div className="relative h-full w-full overflow-hidden bg-[#efe4d6]">
                {showPhoto ? (
                  // eslint-disable-next-line @next/next/no-img-element -- local cover asset with onError fallback
                  <img
                    src={coverPhoto}
                    alt=""
                    draggable={false}
                    onError={() => setPhotoFailed(true)}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <AssetSlot kind="photo" hint="cover.jpg" />
                )}
              </div>
            </div>

            {dedication && (
              <p className="kyndl-emboss mt-6 max-w-xs font-hand text-base text-[#e8c79b]/90">
                {dedication}
              </p>
            )}

            <span className="absolute bottom-6 left-1/2 -translate-x-1/2 animate-pulse font-hand text-sm text-[#e8c79b]/80">
              open me →
            </span>
          </div>
        ) : (
          <div className="flex h-full flex-col items-center justify-center px-8 text-center">
            <p
              className={cn(
                "kyndl-emboss font-cursive text-2xl text-[#f5e9e2]",
              )}
            >
              the end — for now
            </p>
            <p className="kyndl-emboss mt-3 font-hand text-base text-[#e8c79b]">
              made with love on Kyndl
            </p>
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="mt-8 inline-flex items-center gap-1.5 rounded-full border border-[#d4a373]/50 px-4 py-1.5 font-hand text-sm text-[#e8c79b] transition-colors hover:bg-white/5"
              >
                ← close the book
              </button>
            )}
          </div>
        )}
      </div>
    );
  },
);
