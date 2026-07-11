import { Link2, PenLine, Sparkles } from "lucide-react";
import Link from "next/link";

import { ExperiencesExplorer } from "@/components/experiences/experiences-explorer";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/shared/page-header";
import { ROUTES } from "@/constants/routes";
import { createMetadata } from "@/lib/seo";
import { getExperiencesView } from "@/lib/server/experiences";

export const metadata = createMetadata({
  title: "Experiences",
  description:
    "Explore every Kyndl experience — a page-turning scrapbook, a private constellation, a golden-hour memory lane, a jar of notes, a map of your places, and Ludo for two.",
  path: ROUTES.experiences,
});

// Visibility/status/pricing are backend-controlled, fetched fresh per request.
export const dynamic = "force-dynamic";

const STEPS = [
  {
    icon: PenLine,
    title: "Personalize it",
    body: "Add your photos, words, and little secrets — no design skills, done in minutes.",
  },
  {
    icon: Link2,
    title: "Send a link",
    body: "No app to install. Just one private link, sent exactly when it'll mean the most.",
  },
  {
    icon: Sparkles,
    title: "They live it",
    body: "They don't read a card — they step inside a moment made just for them.",
  },
];

export default async function ExperiencesPage() {
  const experiences = await getExperiencesView();
  const liveCount = experiences.filter((e) => e.status === "live").length;

  return (
    <div className="relative overflow-hidden">
      <PageHeader
        eyebrow="The experiences"
        title={
          <>
            Not a card you read.
            <br />
            <span className="kyndl-text-warm">A world you step into.</span>
          </>
        }
        subtitle="Every Kyndl is a little crafted place — turn the pages, trace the stars, walk the lane, open the jar. You make it yours, then send a link they'll never forget."
      >
        <div className="space-y-8">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-[#7A6258]">
            <span className="inline-flex items-center gap-2">
              <span className="size-1.5 rounded-full bg-[#2fb672]" />
              {liveCount} live to try right now
            </span>
            <span className="text-[#E3CDBE]">·</span>
            <span>Personalized in minutes</span>
            <span className="text-[#E3CDBE]">·</span>
            <span>Shared by a private link</span>
          </div>

          {/* how every Kyndl works — the universal model, up front */}
          <div className="rounded-[1.75rem] border border-[#F4DDD0] bg-white/70 p-6 backdrop-blur-sm md:p-8">
            <p className="text-xs font-medium tracking-[0.22em] text-[#C75B39] uppercase">
              How every Kyndl works
            </p>
            <div className="mt-5 grid gap-6 md:grid-cols-3 md:gap-8">
              {STEPS.map((step, i) => (
                <div key={step.title} className="flex gap-4">
                  <span className="relative flex size-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#FF7A59] to-[#F2596F] text-white kyndl-glow-warm">
                    <step.icon className="size-5" />
                    <span className="absolute -right-1.5 -top-1.5 flex size-5 items-center justify-center rounded-full border border-[#F4DDD0] bg-white text-[11px] font-bold text-[#C75B39]">
                      {i + 1}
                    </span>
                  </span>
                  <div>
                    <h3 className="font-display text-lg text-[#3A2A25]">
                      {step.title}
                    </h3>
                    <p className="mt-1 text-sm leading-relaxed text-[#7A6258]">
                      {step.body}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </PageHeader>

      {/* ── The catalog, grouped by what each one is ──────────────── */}
      <section className="relative py-12 md:py-16">
        <PageContainer size="xl" className="relative">
          <ExperiencesExplorer experiences={experiences} />
        </PageContainer>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────── */}
      <section className="relative pb-20 md:pb-28">
        <PageContainer size="md">
          <div className="relative overflow-hidden rounded-[2.5rem] border border-[#F4DDD0] bg-gradient-to-br from-[#FFF1E9] via-[#FDEBE6] to-[#FCE3DC] px-6 py-14 text-center md:px-12 md:py-16">
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
                Pick one and{" "}
                <span className="kyndl-text-warm">make it yours.</span>
              </h2>
              <p className="mx-auto mt-5 max-w-md text-[#7A6258]">
                Free to try, personalized in minutes, and sent exactly when it
                will mean the most.
              </p>
              <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
                <Link
                  href={ROUTES.register}
                  className="inline-flex h-12 items-center justify-center rounded-full bg-gradient-to-r from-[#FF7A59] to-[#F2596F] px-8 text-base font-medium text-white kyndl-glow-warm transition-all duration-500 hover:-translate-y-0.5"
                >
                  Create an account
                </Link>
                <Link
                  href={ROUTES.home}
                  className="inline-flex h-12 items-center justify-center rounded-full border border-[#F2DACE] bg-white/70 px-8 text-base font-medium text-[#3A2A25] transition-all duration-500 hover:border-[#FF7A59]/50 hover:bg-white"
                >
                  See how it works
                </Link>
              </div>
            </div>
          </div>
        </PageContainer>
      </section>
    </div>
  );
}
