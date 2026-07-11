import { ArrowRight, ArrowUpRight, Check } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { EmbeddedExperience } from "@/components/experiences/embedded-experience";
import { PageContainer } from "@/components/layout/page-container";
import { ExperienceIcon } from "@/components/shared/experience-icon";
import { ExperiencePrice } from "@/components/shared/experience-price";
import { ROUTES } from "@/constants/routes";
import { JarPreview } from "@/features/memory-jar/components/jar-preview";
import { MemoryPagesLanding } from "@/features/memory-pages/components/marketing/memory-pages-landing";
import { ScrapbookTemplatesShowcase } from "@/features/scrapbook/components/templates-showcase";
import { experienceHref, getExperience } from "@/lib/experiences";
import { createMetadata } from "@/lib/seo";
import {
  getExperiencesView,
  getExperienceView,
} from "@/lib/server/experiences";

// Which experiences are live/visible is backend-controlled, resolved per request.
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const exp = getExperience(slug);
  if (!exp) return createMetadata({ title: "Experience" });
  return createMetadata({
    title: exp.name,
    description: exp.description,
    path: experienceHref(slug),
  });
}

export default async function ExperienceProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [exp, all] = await Promise.all([
    getExperienceView(slug),
    getExperiencesView(),
  ]);
  if (!exp || exp.status !== "live") notFound();

  const isEmbedded = exp.embedded === true;
  const launchHref = exp.liveHref ?? ROUTES.home;
  const makeHref = exp.makeHref ?? ROUTES.register;
  const more = all
    .filter((e) => e.status === "live" && e.slug !== exp.slug)
    .slice(0, 3);

  // Memory Pages gets a bespoke, editorial product page instead of the generic
  // template every other experience shares.
  if (exp.slug === "memory-pages") {
    return <MemoryPagesLanding exp={exp} more={more} makeHref={makeHref} />;
  }

  return (
    <div className="relative overflow-hidden">
      {/* ── Hero ──────────────────────────────────────────────────── */}
      <section className="relative py-14 md:py-20">
        <div
          className="pointer-events-none absolute inset-0 opacity-70"
          style={{
            background:
              "radial-gradient(ellipse 46% 38% at 18% 8%, rgba(255,160,120,0.3) 0%, transparent 72%), radial-gradient(ellipse 40% 34% at 88% 70%, rgba(242,89,111,0.22) 0%, transparent 72%)",
          }}
          aria-hidden
        />
        <PageContainer size="xl" className="relative">
          <nav className="mb-8 flex items-center gap-1.5 text-sm text-[#92786C]">
            <Link
              href={ROUTES.experiences}
              className="transition-colors hover:text-[#3A2A25]"
            >
              Experiences
            </Link>
            <span aria-hidden>/</span>
            <span className="text-[#3A2A25]">{exp.name}</span>
          </nav>

          {isEmbedded ? (
            <div>
              {/* Merged: the product page IS the live experience. */}
              <div className="mx-auto max-w-3xl text-center">
                <span className="inline-flex items-center gap-2 rounded-full border border-[#F2DACE] bg-white/70 px-4 py-1.5 text-xs font-medium tracking-wide text-[#C75B39] backdrop-blur-sm">
                  <span className="size-1.5 rounded-full bg-[#2fb672]" />
                  {exp.eyebrow} · Live
                </span>
                <h1 className="mt-6 font-display text-4xl leading-[1.06] tracking-tight text-[#3A2A25] md:text-5xl lg:text-6xl">
                  {exp.name}
                </h1>
                <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-[#7A6258]">
                  {exp.description}
                </p>
                <ExperiencePrice
                  price={exp.price}
                  variant="full"
                  className="mt-8 items-center text-center"
                />
                <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
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

              {/* the actual experience, playing right here */}
              <div className="mt-14">
                <EmbeddedExperience slug={exp.slug} />
              </div>
            </div>
          ) : (
            <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-14">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full border border-[#F2DACE] bg-white/70 px-4 py-1.5 text-xs font-medium tracking-wide text-[#C75B39] backdrop-blur-sm">
                  <span className="size-1.5 rounded-full bg-[#2fb672]" />
                  {exp.eyebrow} · Live
                </span>
                <h1 className="mt-6 font-display text-4xl leading-[1.06] tracking-tight text-[#3A2A25] md:text-5xl lg:text-6xl">
                  {exp.name}
                </h1>
                <p className="mt-6 max-w-lg text-lg leading-relaxed text-[#7A6258]">
                  {exp.description}
                </p>
                <ExperiencePrice price={exp.price} variant="full" className="mt-8" />
                <div className="mt-9 flex flex-wrap items-center gap-4">
                  <Link
                    href={launchHref}
                    className="group inline-flex h-12 items-center justify-center rounded-full bg-gradient-to-r from-[#FF7A59] to-[#F2596F] px-8 text-base font-medium text-white kyndl-glow-warm transition-all duration-500 hover:-translate-y-0.5"
                  >
                    {exp.inlineEmbed ? "Open full screen" : "Launch experience"}
                    <ArrowUpRight className="ml-2 size-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </Link>
                  <Link
                    href={makeHref}
                    className="inline-flex h-12 items-center justify-center rounded-full border border-[#F2DACE] bg-white/70 px-8 text-base font-medium text-[#3A2A25] transition-all duration-500 hover:border-[#FF7A59]/50 hover:bg-white"
                  >
                    Make your own
                  </Link>
                </div>
              </div>

              {/* preview block — the live experience when it embeds inline,
                  otherwise a static gradient placeholder. */}
              <div className="relative">
                <div
                  className="relative aspect-[4/3] w-full overflow-hidden rounded-[2rem] border border-[#F0DAC9] shadow-[0_40px_90px_-40px_rgba(58,42,37,0.55)]"
                  style={
                    exp.inlineEmbed ? undefined : { background: exp.previewGradient }
                  }
                >
                  {exp.inlineEmbed ? (
                    <EmbeddedExperience slug={exp.slug} />
                  ) : exp.slug === "memory-jar" ? (
                    // an auto-playing taste of the jar — opens itself so the
                    // visitor sees the ritual without launching the experience.
                    <JarPreview />
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 p-8 text-center">
                      <span className="flex size-20 items-center justify-center rounded-3xl border border-white/50 bg-white/80 text-[#FF7A59] backdrop-blur-sm">
                        <ExperienceIcon name={exp.icon} className="size-10" />
                      </span>
                      <p className="max-w-xs text-sm font-medium text-[#3A2A25]/80">
                        {exp.tagline}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </PageContainer>
      </section>

      {/* ── Templates (scrapbook) ─────────────────────────────────── */}
      {exp.slug === "scrapbook" && (
        <section className="relative border-t border-[#F2DACE] py-16 md:py-20">
          <PageContainer size="xl">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-sm font-medium tracking-[0.2em] text-[#C75B39] uppercase">
                  Start in seconds
                </p>
                <h2 className="mt-3 font-display text-3xl text-[#3A2A25] md:text-4xl">
                  Pick a template, make it yours
                </h2>
                <p className="mt-3 max-w-xl text-[#7A6258]">
                  Choose a ready-made theme and just fill in your photos and
                  words — or start from a blank book and build it your own way.
                </p>
              </div>
              <Link
                href={ROUTES.scrapbookBuild}
                className="group inline-flex h-11 items-center justify-center rounded-full border border-[#F2DACE] bg-white px-6 text-sm font-medium text-[#3A2A25] transition-all duration-300 hover:border-[#FF7A59]/50 hover:bg-[#FFF7F1]"
              >
                Build from scratch
                <ArrowRight className="ml-2 size-4 transition-transform duration-300 group-hover:translate-x-0.5" />
              </Link>
            </div>
            <div className="mt-10">
              <ScrapbookTemplatesShowcase />
            </div>
          </PageContainer>
        </section>
      )}

      {/* ── Highlights ────────────────────────────────────────────── */}
      <section className="relative py-16 md:py-24">
        <PageContainer size="xl">
          <p className="text-sm font-medium tracking-[0.2em] text-[#C75B39] uppercase">
            What makes it special
          </p>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {exp.highlights.map((h) => {
              return (
                <div
                  key={h.title}
                  className="kyndl-card-soft rounded-3xl border border-[#F4DDD0] bg-white p-7"
                >
                  <span className="flex size-12 items-center justify-center rounded-2xl border border-[#F4DDD0] bg-[#FFF7F1] text-[#FF7A59]">
                    <ExperienceIcon name={h.icon} className="size-5" />
                  </span>
                  <h3 className="mt-5 font-display text-xl text-[#3A2A25]">
                    {h.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-[#7A6258]">
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
          <p className="text-sm font-medium tracking-[0.2em] text-[#C75B39] uppercase">
            How it works
          </p>
          <div className="mt-10 grid gap-8 md:grid-cols-3">
            {exp.steps.map((step, index) => (
              <div key={step.title} className="flex gap-4">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#FF7A59] to-[#F2596F] text-sm font-bold text-white">
                  {index + 1}
                </span>
                <div>
                  <h3 className="font-display text-lg text-[#3A2A25]">
                    {step.title}
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-[#7A6258]">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-[#7A6258]">
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
            <div className="mt-8 grid gap-5 md:grid-cols-3">
              {more.map((m) => {
                return (
                  <Link
                    key={m.slug}
                    href={experienceHref(m.slug)}
                    className="kyndl-card-soft group flex flex-col rounded-3xl border border-[#F4DDD0] bg-white p-6 transition-all duration-500 hover:-translate-y-1 hover:border-[#FF7A59]/45"
                  >
                    <span className="flex size-11 items-center justify-center rounded-2xl border border-[#F4DDD0] bg-[#FFF7F1] text-[#FF7A59] transition-colors group-hover:text-[#F2596F]">
                      <ExperienceIcon name={m.icon} className="size-5" />
                    </span>
                    <h3 className="mt-4 font-display text-lg text-[#3A2A25]">
                      {m.name}
                    </h3>
                    <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-[#7A6258]">
                      {m.tagline}
                    </p>
                  </Link>
                );
              })}
            </div>
          </PageContainer>
        </section>
      )}

      {/* ── CTA ───────────────────────────────────────────────────── */}
      <section className="relative py-16 md:py-24">
        <PageContainer size="md">
          <div className="relative overflow-hidden rounded-[2.5rem] border border-[#F4DDD0] bg-gradient-to-br from-[#FFF1E9] via-[#FDEBE6] to-[#FCE3DC] px-6 py-14 text-center md:px-12 md:py-20">
            <div
              className="pointer-events-none absolute inset-0 opacity-80"
              style={{
                background:
                  "radial-gradient(ellipse 50% 60% at 20% 0%, rgba(255,160,120,0.4) 0%, transparent 65%), radial-gradient(ellipse 50% 60% at 85% 100%, rgba(242,89,111,0.3) 0%, transparent 65%)",
              }}
              aria-hidden
            />
            <div className="relative">
              <h2 className="mx-auto max-w-xl font-display text-3xl leading-tight text-[#3A2A25] md:text-4xl">
                Make a <span className="kyndl-text-warm">{exp.name}</span> of
                your own.
              </h2>
              <p className="mx-auto mt-5 max-w-md text-[#7A6258]">
                Personalize it in minutes and send it exactly when it will mean
                the most.
              </p>
              <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
                <Link
                  href={isEmbedded ? makeHref : launchHref}
                  className="inline-flex h-12 items-center justify-center rounded-full bg-gradient-to-r from-[#FF7A59] to-[#F2596F] px-8 text-base font-medium text-white kyndl-glow-warm transition-all duration-500 hover:-translate-y-0.5"
                >
                  {isEmbedded ? "Make your own" : `Try ${exp.name}`}
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
