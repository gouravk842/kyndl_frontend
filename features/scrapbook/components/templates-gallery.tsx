"use client";

import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";

import { ROUTES } from "@/constants/routes";

import { TEMPLATES } from "../templates";
import { ScrapbookPage } from "./scrapbook-page";

/**
 * Marketing gallery of scrapbook templates. Each card previews the template's
 * first page (live) and deep-links into the builder, which loads that template
 * in guided mode. A "blank book" card starts a free build from scratch.
 */
export function TemplatesGallery() {
  const previews = useMemo(
    () => TEMPLATES.map((t) => ({ t, story: t.build() })),
    [],
  );

  return (
    <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
      {/* blank book */}
      <Link
        href={ROUTES.scrapbookBuild}
        className="group flex flex-col overflow-hidden rounded-2xl border border-[#F2DACE] bg-white text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#FF7A59]/55 hover:shadow-lg"
      >
        <div className="flex aspect-[460/620] items-center justify-center bg-gradient-to-br from-[#f7ede0] to-[#efe0cd]">
          <div className="text-center">
            <div className="text-4xl">✏️</div>
            <p className="mt-2 font-hand text-xl text-[#9a7d6a]">blank book</p>
          </div>
        </div>
        <div className="flex flex-1 flex-col p-4">
          <p className="font-display text-base text-[#3A2A25]">
            Start from scratch
          </p>
          <p className="mt-1 text-xs text-[#92786C]">
            A blank book you build your own way.
          </p>
          <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-[#C75B39]">
            Start building
            <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </span>
        </div>
      </Link>

      {/* templates */}
      {previews.map(({ t, story: preview }) => (
        <Link
          key={t.id}
          href={`${ROUTES.scrapbookBuild}?template=${t.id}`}
          className="group flex flex-col overflow-hidden rounded-2xl border border-[#F2DACE] bg-white text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
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
          <div className="flex flex-1 flex-col p-4">
            <p className="font-display text-base text-[#3A2A25]">{t.name}</p>
            <p className="mt-1 line-clamp-2 text-xs text-[#92786C]">
              {t.tagline}
            </p>
            <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-[#C75B39]">
              Customise this
              <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}
