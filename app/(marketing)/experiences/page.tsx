import Link from "next/link";

import { ExperiencesExplorer } from "@/components/experiences/experiences-explorer";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/shared/page-header";
import { ROUTES } from "@/constants/routes";
import { ideaHref } from "@/features/ideas/idea-href";
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

export default async function ExperiencesPage() {
  const experiences = await getExperiencesView();

  return (
    <div className="relative overflow-hidden">
      <PageHeader
        compact
        eyebrow="The experiences"
        title={
          <>
            Pick a world.
            <br />
            <span className="kyndl-text-warm">Make it yours.</span>
          </>
        }
        subtitle="Every Kyndl is a little crafted place — fill it with your story, then send a private link they'll never forget."
      >
        <p className="inline-flex items-center gap-2 text-sm text-[#7A6258]">
          <span className="size-1.5 rounded-full bg-[#2fb672]" />
          {experiences.length} live to try right now
        </p>
      </PageHeader>

      <section className="relative py-10 md:py-14">
        <PageContainer size="xl" className="relative">
          <ExperiencesExplorer experiences={experiences} />
        </PageContainer>
      </section>

      <section className="border-y border-[#F2DACE] bg-[#FFF7F1] py-12 md:py-16">
        <PageContainer size="md" className="text-center">
          <h2 className="font-display text-2xl text-[#3A2A25] md:text-3xl">
            None of these is the one?
          </h2>
          <p className="mx-auto mt-3 max-w-md text-[#7A6258]">
            If yours isn&apos;t on the shelf, tell us the moment you wanted.
            We&apos;ll try to figure it out.
          </p>
          <Link
            href={ideaHref({ source: "experiences" })}
            className="mt-6 inline-flex h-12 items-center justify-center rounded-full bg-gradient-to-r from-[#FF7A59] to-[#F2596F] px-8 text-base font-medium text-white kyndl-glow-warm transition-all duration-300 hover:-translate-y-0.5"
          >
            Tell us what you were hoping to find
          </Link>
        </PageContainer>
      </section>

      <section className="relative py-16 md:py-24">
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
            {/* floating doodle accents in the CTA */}
            <span
              className="pointer-events-none absolute left-8 top-8 hidden size-8 opacity-40 md:block"
              aria-hidden
            >
              <svg viewBox="0 0 24 22" className="size-full">
                <path
                  d="M12 20S3 14 3 8a4.5 4.5 0 0 1 9-1 4.5 4.5 0 0 1 9 1c0 6-9 12-9 12Z"
                  fill="none"
                  stroke="#C75B39"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <span
              className="pointer-events-none absolute bottom-10 right-10 hidden size-7 opacity-40 md:block"
              aria-hidden
            >
              <svg viewBox="0 0 24 24" className="size-full">
                <path
                  d="M12 3v6M12 15v6M3 12h6M15 12h6"
                  fill="none"
                  stroke="#FF7A59"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
              </svg>
            </span>
            <div className="relative">
              <h2 className="mx-auto max-w-xl font-display text-3xl leading-tight text-[#3A2A25] md:text-4xl">
                Ready when{" "}
                <span className="kyndl-text-warm">the moment is.</span>
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
                  Back to home
                </Link>
              </div>
            </div>
          </div>
        </PageContainer>
      </section>
    </div>
  );
}
