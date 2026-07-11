"use client";

import { forwardRef } from "react";

import { cn } from "@/lib/utils";

/** A single contents row: chapter title, dotted leader, page number. */
export type IndexEntry = {
  /** Label shown in the contents list. */
  label: string;
  /** Human page number printed in the list. */
  number: number;
  /** Leaf index to turn to when the row is tapped. */
  leaf: number;
};

type IndexPageProps = {
  title?: string;
  entries: IndexEntry[];
  onJump: (leaf: number) => void;
  side: "left" | "right";
};

/**
 * The in-book Contents leaf — a real index page (chapter names + page numbers
 * with dotted leaders) so the scrapbook reads like a bound keepsake. Rows are
 * `<button>`s, so react-pageflip forwards the click instead of turning the page.
 */
export const IndexPage = forwardRef<HTMLDivElement, IndexPageProps>(
  function IndexPage({ title = "Contents", entries, onJump, side }, ref) {
    return (
      <div
        ref={ref}
        className="kyndl-paper relative h-full w-full overflow-hidden"
      >
        <span
          aria-hidden
          className="kyndl-paper-grain pointer-events-none absolute inset-0 z-[2]"
        />
        <span
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-0 z-[3]",
            side === "left"
              ? "kyndl-page-gutter-right"
              : "kyndl-page-gutter-left",
          )}
        />

        <div className="relative z-[4] flex h-full flex-col px-[10%] py-[12%]">
          <header className="mb-[6%]">
            <p className="font-hand text-base tracking-wide text-[#c08552]">
              turn to a memory
            </p>
            <h3 className="font-display text-3xl text-[#3a2a25]">{title}</h3>
            <span className="mt-2 block h-px w-16 bg-[#d8b48c]" />
          </header>

          <ul className="flex flex-1 flex-col justify-center gap-[3%]">
            {entries.map((entry) => (
              <li key={entry.leaf}>
                <button
                  type="button"
                  onClick={() => onJump(entry.leaf)}
                  className="group flex w-full items-baseline gap-2 rounded-md py-0.5 text-left transition-colors"
                >
                  <span className="font-hand text-[15px] text-[#5b4034] transition-colors group-hover:text-[#C75B39]">
                    {entry.label}
                  </span>
                  <span
                    aria-hidden
                    className="mx-1 min-w-3 flex-1 translate-y-[-3px] border-b border-dotted border-[#c9ab86]"
                  />
                  <span className="font-hand text-[15px] tabular-nums text-[#8a6f5c] transition-colors group-hover:text-[#C75B39]">
                    {entry.number}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  },
);

/**
 * Inside-cover flyleaf — a soft cream endpaper with an optional half-title, so
 * opening the cover reveals a calm leaf before the contents (like a real book).
 */
export const FlyLeaf = forwardRef<
  HTMLDivElement,
  { title?: string; caption?: string }
>(function FlyLeaf({ title, caption }, ref) {
  return (
    <div
      ref={ref}
      className="relative h-full w-full overflow-hidden"
      style={{
        background:
          "radial-gradient(ellipse 90% 70% at 35% 20%, #fbf0e0 0%, #f2e2cd 60%, #e9d6bd 100%)",
      }}
    >
      <span
        aria-hidden
        className="kyndl-paper-grain pointer-events-none absolute inset-0 opacity-40"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute inset-6 rounded-[3px] border border-[#cBA36b]/40"
      />
      {(title || caption) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center px-8 text-center">
          {title && (
            <h3 className="font-cursive text-3xl text-[#8a5a3c]">{title}</h3>
          )}
          {caption && (
            <p className="mt-2 max-w-[60%] font-hand text-sm text-[#a07a5c]">
              {caption}
            </p>
          )}
        </div>
      )}
    </div>
  );
});
