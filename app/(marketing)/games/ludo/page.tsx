import Link from "next/link";

import { LudoExperience } from "@/features/ludo/components/ludo-experience";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Ludo for Two",
  description:
    "A beautifully crafted Ludo board built for couples — roll, race, and capture, with an optional activity mode that turns stars, captures, and homecomings into playful couple challenges.",
  path: "/games/ludo",
});

export default function LudoPage() {
  return (
    <section className="relative overflow-hidden py-6 sm:py-8">
      {/* warm ambient wash, matching the other marketing experiences */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-80"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 25%, rgba(255,160,120,0.20) 0%, transparent 70%)",
        }}
      />
      <div className="relative mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="mb-1 text-xs font-medium tracking-[0.2em] text-[#C75B39] uppercase">
              Play together
            </p>
            <h1 className="font-display text-3xl text-[#3A2A25] sm:text-4xl">
              Ludo for Two
            </h1>
            <p className="mt-1 max-w-xl text-sm text-[#7A6258]">
              Classic Ludo, reimagined for date night — with a couple-activity
              mode you can tune to sweet, fun, or spicy.
            </p>
          </div>
          <Link
            href="/games"
            className="inline-flex h-10 items-center rounded-full border border-[#F2DACE] bg-white/70 px-4 text-sm text-[#3A2A25] transition-colors hover:border-[#FF7A59]/50 hover:bg-white"
          >
            ← All Games
          </Link>
        </header>

        <LudoExperience />
      </div>
    </section>
  );
}
