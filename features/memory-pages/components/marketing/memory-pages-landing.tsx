import { ArrowRight, ArrowUpRight, Check } from "lucide-react";
import Link from "next/link";
import type { ComponentType } from "react";

import { PageContainer } from "@/components/layout/page-container";
import { ExperienceIcon } from "@/components/shared/experience-icon";
import { ExperiencePrice } from "@/components/shared/experience-price";
import { ROUTES } from "@/constants/routes";
import {
  previewAlbum,
  previewAssets,
} from "@/features/memory-pages/data/marketing-preview";
import { experienceHref } from "@/lib/experiences";
import type { ExperienceView } from "@/lib/server/experiences";

import { MemoryPagesExperience } from "../memory-pages-experience";
import {
  CameraIllustration,
  EnvelopeSealIllustration,
  HandPhotoIllustration,
  JournalIllustration,
  OpenBookIllustration,
  StampIllustration,
  WriteBookIllustration,
} from "./illustrations";

/**
 * A bespoke, editorial product page for Memory Pages — the generic
 * `[slug]` template gives every experience the same layout; this one leans all
 * the way into the "printed photo album on a warm desk" idea: serif display
 * type, a live album framed as a desk scene, hand-drawn line-art, and a
 * scrapbook-collage close. Reached only for `slug === "memory-pages"`.
 */

type Props = {
  exp: ExperienceView;
  more: ExperienceView[];
  makeHref: string;
};

// The three highlights map, in order, to a drawn tile icon.
const HIGHLIGHT_ART: ComponentType<{ className?: string }>[] = [
  CameraIllustration,
  JournalIllustration,
  OpenBookIllustration,
];

// The three steps map, in order, to a drawn scene.
const STEP_ART: ComponentType<{ className?: string }>[] = [
  HandPhotoIllustration,
  WriteBookIllustration,
  EnvelopeSealIllustration,
];

/* A decorative empty polaroid frame, tilted, purely ornamental. */
function Polaroid({
  className,
  rotate,
  tint = "#f3e2d3",
}: {
  className?: string;
  rotate: number;
  tint?: string;
}) {
  return (
    <div
      className={className}
      style={{ transform: `rotate(${rotate}deg)` }}
      aria-hidden
    >
      <div className="rounded-[3px] bg-white p-2 pb-6 shadow-[0_16px_30px_-16px_rgba(58,42,37,0.5)]">
        <div
          className="size-full rounded-[2px]"
          style={{
            background: `linear-gradient(150deg, ${tint} 0%, #e7d0bd 100%)`,
          }}
        />
      </div>
    </div>
  );
}

/* A strip of translucent washi tape. */
function Washi({
  className,
  rotate,
  from,
  to,
}: {
  className?: string;
  rotate: number;
  from: string;
  to: string;
}) {
  return (
    <span
      className={className}
      aria-hidden
      style={{
        transform: `rotate(${rotate}deg)`,
        background: `repeating-linear-gradient(45deg, ${from} 0 6px, ${to} 6px 12px)`,
        boxShadow: "0 6px 14px -8px rgba(58,42,37,0.35)",
      }}
    />
  );
}

export function MemoryPagesLanding({ exp, more, makeHref }: Props) {
  return (
    <div className="relative overflow-hidden">
      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="relative pt-12 pb-8 md:pt-16">
        <div
          className="pointer-events-none absolute inset-0 opacity-80"
          style={{
            background:
              "radial-gradient(ellipse 44% 40% at 16% 4%, rgba(240,161,61,0.24) 0%, transparent 70%), radial-gradient(ellipse 46% 44% at 86% 12%, rgba(242,89,111,0.16) 0%, transparent 72%)",
          }}
          aria-hidden
        />
        <PageContainer size="xl" className="relative">
          <div className="grid items-center gap-12 lg:grid-cols-[0.92fr_1.08fr] lg:gap-14">
            {/* ── Left: the pitch ── */}
            <div className="max-w-xl text-center lg:text-left">
              <span className="text-xs font-medium uppercase tracking-[0.18em] text-[#C75B39]">
                {exp.eyebrow}
              </span>
              <h1 className="mt-4 font-serif text-5xl leading-[1.02] tracking-tight text-[#3A2A25] md:text-6xl">
                {exp.name}
              </h1>
              <p className="mx-auto mt-6 max-w-lg text-lg leading-relaxed text-[#7A6258] lg:mx-0">
                {exp.description}
              </p>
              <ExperiencePrice
                price={exp.price}
                variant="full"
                className="mt-8 items-center lg:items-start"
              />
              <div className="mt-9 flex flex-wrap items-center justify-center gap-4 lg:justify-start">
                <Link
                  href={makeHref}
                  className="group inline-flex h-12 items-center justify-center rounded-full bg-gradient-to-r from-[#FF7A59] to-[#F2596F] px-8 text-base font-medium text-white kyndl-glow-warm transition-all duration-500 hover:-translate-y-0.5"
                >
                  Make your own
                  <ArrowUpRight className="ml-2 size-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </Link>
                <Link
                  href={ROUTES.experiences}
                  className="inline-flex h-12 items-center justify-center rounded-full border border-[#F2DACE] bg-white/70 px-8 text-base font-medium text-[#3A2A25] transition-all duration-500 hover:border-[#FF7A59]/50 hover:bg-white"
                >
                  Browse experiences
                </Link>
              </div>
            </div>

            {/* ── Right: the live demo, open on the page (no desk frame) ── */}
            <div className="relative mx-auto w-full max-w-[560px]">
              <MemoryPagesExperience
                doc={previewAlbum}
                assets={previewAssets}
                autoPlay
                fit="container"
              />
            </div>
          </div>
        </PageContainer>
      </section>

      {/* ── What makes it special ─────────────────────────────────── */}
      <section className="relative py-16 md:py-24">
        <PageContainer size="xl">
          <p className="text-center text-sm font-medium tracking-[0.2em] text-[#C75B39] uppercase">
            What makes it special
          </p>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {exp.highlights.map((h, i) => {
              const Art = HIGHLIGHT_ART[i] ?? CameraIllustration;
              return (
                <div
                  key={h.title}
                  className="group relative overflow-hidden rounded-[1.75rem] border border-[#F4DDD0] bg-white p-8 kyndl-card-soft transition-transform duration-500 hover:-translate-y-1"
                >
                  <div
                    className="pointer-events-none absolute -top-10 -right-10 size-40 rounded-full opacity-60 transition-opacity duration-500 group-hover:opacity-100"
                    style={{
                      background:
                        "radial-gradient(circle, rgba(255,122,89,0.14) 0%, transparent 70%)",
                    }}
                    aria-hidden
                  />
                  <span className="relative flex size-16 items-center justify-center rounded-2xl border border-[#F4DDD0] bg-[#FFF7F1] text-[#FF7A59]">
                    <Art className="size-9" />
                  </span>
                  <h3 className="relative mt-6 font-serif text-xl text-[#3A2A25]">
                    {h.title}
                  </h3>
                  <p className="relative mt-2 text-sm leading-relaxed text-[#7A6258]">
                    {h.description}
                  </p>
                </div>
              );
            })}
          </div>
        </PageContainer>
      </section>

      {/* ── How it works ──────────────────────────────────────────── */}
      <section className="relative border-y border-[#F2DACE] bg-[#FCEEE3]/60 py-16 md:py-24">
        <PageContainer size="xl">
          <p className="text-center text-sm font-medium tracking-[0.2em] text-[#C75B39] uppercase">
            How it works
          </p>

          <div className="mt-14 grid gap-10 md:grid-cols-3">
            {exp.steps.map((step, index) => {
              const Art = STEP_ART[index] ?? HandPhotoIllustration;
              return (
                <div key={step.title} className="relative text-center">
                  {/* connector line between steps (desktop only) */}
                  {index < exp.steps.length - 1 && (
                    <span
                      className="pointer-events-none absolute top-10 left-[calc(50%+3rem)] hidden h-px w-[calc(100%-6rem)] bg-[repeating-linear-gradient(90deg,#E4C9B4_0_6px,transparent_6px_12px)] md:block"
                      aria-hidden
                    />
                  )}
                  <div className="mx-auto flex h-20 w-28 items-center justify-center text-[#C75B39]">
                    <Art className="h-full w-auto" />
                  </div>
                  <span className="mx-auto mt-5 flex size-8 items-center justify-center rounded-full bg-gradient-to-br from-[#FF7A59] to-[#F2596F] text-sm font-bold text-white">
                    {index + 1}
                  </span>
                  <h3 className="mt-4 font-serif text-lg text-[#3A2A25]">
                    {step.title}
                  </h3>
                  <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-[#7A6258]">
                    {step.description}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="mt-14 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-[#7A6258]">
            {[
              "Personalized in minutes",
              "No design skills",
              "Share by link",
            ].map((item) => (
              <span key={item} className="inline-flex items-center gap-2">
                <Check className="size-4 text-[#FF7A59]" />
                {item}
              </span>
            ))}
          </div>
        </PageContainer>
      </section>

      {/* ── More experiences ──────────────────────────────────────── */}
      {more.length > 0 && (
        <section className="relative py-16 md:py-24">
          <PageContainer size="xl">
            <div className="flex items-end justify-between gap-4">
              <p className="text-sm font-medium tracking-[0.2em] text-[#C75B39] uppercase">
                More experiences
              </p>
              <Link
                href={ROUTES.experiences}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-[#C75B39] hover:text-[#3A2A25]"
              >
                View all
                <ArrowRight className="size-4" />
              </Link>
            </div>
            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {more.map((m) => (
                <Link
                  key={m.slug}
                  href={experienceHref(m.slug)}
                  className="group relative flex min-h-56 flex-col justify-end overflow-hidden rounded-[1.75rem] border border-[#F0DAC9] p-6 shadow-[0_30px_70px_-40px_rgba(58,42,37,0.55)] transition-transform duration-500 hover:-translate-y-1"
                  style={{ background: m.previewGradient }}
                >
                  <div
                    className="absolute inset-0"
                    style={{
                      background:
                        "linear-gradient(180deg, rgba(28,18,14,0) 30%, rgba(28,18,14,0.72) 100%)",
                    }}
                    aria-hidden
                  />
                  <span className="relative flex size-11 items-center justify-center rounded-2xl border border-white/40 bg-white/15 text-white backdrop-blur-sm">
                    <ExperienceIcon name={m.icon} className="size-5" />
                  </span>
                  <h3 className="relative mt-4 font-serif text-xl text-white">
                    {m.name}
                  </h3>
                  <p className="relative mt-1.5 line-clamp-2 text-sm leading-relaxed text-white/80">
                    {m.tagline}
                  </p>
                </Link>
              ))}
            </div>
          </PageContainer>
        </section>
      )}

      {/* ── Collage CTA ───────────────────────────────────────────── */}
      <section className="relative py-16 md:py-24">
        <PageContainer size="lg">
          <div
            className="relative overflow-hidden rounded-[2.5rem] border border-[#F4DDD0] px-6 py-16 kyndl-grain md:px-12 md:py-24"
            style={{
              background:
                "linear-gradient(135deg, #FBE3D6 0%, #F7D9CE 45%, #F3CBC0 100%)",
            }}
          >
            {/* scattered paper scraps */}
            <Washi
              rotate={-24}
              from="rgba(255,255,255,0.85)"
              to="rgba(255,255,255,0.45)"
              className="pointer-events-none absolute top-8 left-[-2rem] hidden h-10 w-40 rounded-[2px] sm:block"
            />
            <Washi
              rotate={16}
              from="rgba(214,155,120,0.7)"
              to="rgba(214,155,120,0.3)"
              className="pointer-events-none absolute right-10 bottom-10 hidden h-9 w-32 rounded-[2px] sm:block"
            />
            <Polaroid
              rotate={-10}
              className="pointer-events-none absolute -top-4 right-8 hidden w-24 md:block"
            />
            <StampIllustration className="pointer-events-none absolute bottom-8 left-10 hidden w-14 text-[#C75B39]/50 md:block" />

            <div className="relative mx-auto max-w-xl rounded-[1.5rem] border border-white/70 bg-white/80 px-6 py-10 text-center shadow-[0_30px_70px_-40px_rgba(58,42,37,0.5)] backdrop-blur-sm md:px-12">
              <h2 className="font-serif text-3xl leading-tight text-[#3A2A25] md:text-4xl">
                Make a <span className="kyndl-text-warm">Memory Pages</span> of
                your own.
              </h2>
              <p className="mx-auto mt-4 max-w-md text-[#7A6258]">
                Lay out your photos, add a few words, and send a book they can
                flip through — personalized in minutes.
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                <Link
                  href={makeHref}
                  className="inline-flex h-12 items-center justify-center rounded-full bg-gradient-to-r from-[#FF7A59] to-[#F2596F] px-8 text-base font-medium text-white kyndl-glow-warm transition-all duration-500 hover:-translate-y-0.5"
                >
                  Make your own
                </Link>
                <Link
                  href={ROUTES.register}
                  className="inline-flex h-12 items-center justify-center rounded-full border border-[#F2DACE] bg-white/70 px-8 text-base font-medium text-[#3A2A25] transition-all duration-500 hover:border-[#FF7A59]/50 hover:bg-white"
                >
                  Create an account
                </Link>
              </div>
            </div>
          </div>
        </PageContainer>
      </section>
    </div>
  );
}
