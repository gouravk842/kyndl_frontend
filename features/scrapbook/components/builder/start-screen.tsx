"use client";

import { useMemo } from "react";

import { isEmptyBody } from "../../editor/render";
import { useBuilderStore } from "../../store/builder.store";
import { TEMPLATES } from "../../templates";
import { ScrapbookPage } from "../scrapbook-page";

/**
 * First screen of the builder: choose a starting point. The user can continue an
 * existing draft, start a blank free-form book, or pick a template (which loads
 * a designed, content-only scrapbook).
 */
export function StartScreen() {
  const startBlank = useBuilderStore((s) => s.startBlank);
  const loadTemplate = useBuilderStore((s) => s.loadTemplate);
  const story = useBuilderStore((s) => s.story);

  // Build each template once for a live thumbnail of its first page.
  const previews = useMemo(
    () => TEMPLATES.map((t) => ({ t, story: t.build() })),
    [],
  );

  const hasDraft =
    story.pages.length > 1 ||
    !!story.templateId ||
    story.title !== "Our Story" ||
    story.pages.some((p) => !isEmptyBody(p.body));

  return (
    <div className="rounded-2xl border border-[#F2DACE] bg-[#FFFBF6] p-6 sm:p-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl text-[#3A2A25]">
            How would you like to start?
          </h2>
          <p className="text-sm text-[#92786C]">
            Pick a ready-made template and just fill it in, or build your own
            from a blank book.
          </p>
        </div>
        {hasDraft && (
          <button
            type="button"
            onClick={() => useBuilderStore.setState({ chosen: true })}
            className="inline-flex h-10 items-center rounded-full border border-[#F2DACE] bg-white px-5 text-sm text-[#3A2A25] transition-colors hover:border-[#FF7A59]/50"
          >
            ← Continue your draft
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {/* blank book */}
        <button
          type="button"
          onClick={startBlank}
          className="group flex flex-col overflow-hidden rounded-xl border border-[#F2DACE] bg-white text-left transition-all hover:-translate-y-0.5 hover:border-[#FF7A59]/60 hover:shadow-md"
        >
          <div className="flex aspect-[460/620] items-center justify-center bg-[#f3e9dd]">
            <div className="text-center">
              <div className="text-3xl">✏️</div>
              <p className="mt-2 font-hand text-lg text-[#9a7d6a]">
                blank book
              </p>
            </div>
          </div>
          <div className="p-3">
            <p className="text-sm font-semibold text-[#3A2A25]">
              Start from scratch
            </p>
            <p className="text-xs text-[#92786C]">Build it your way.</p>
          </div>
        </button>

        {/* templates */}
        {previews.map(({ t, story: preview }) => (
          <button
            key={t.id}
            type="button"
            onClick={() => loadTemplate(t.id)}
            className="group flex flex-col overflow-hidden rounded-xl border border-[#F2DACE] bg-white text-left transition-all hover:-translate-y-0.5 hover:shadow-md"
            style={{ borderTopColor: t.accent, borderTopWidth: 3 }}
          >
            <div className="pointer-events-none aspect-[460/620] overflow-hidden bg-[#f3e9dd]">
              {preview.pages[0] && (
                <ScrapbookPage
                  page={preview.pages[0]}
                  pageNumber={1}
                  side="right"
                />
              )}
            </div>
            <div className="p-3">
              <p className="text-sm font-semibold text-[#3A2A25]">{t.name}</p>
              <p className="text-xs text-[#92786C]">{t.tagline}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
