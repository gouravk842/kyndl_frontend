import { MatcherExperience } from "@/features/desire-matcher/components/matcher-experience";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Desire Matcher",
  description:
    "An adults-only yes/maybe/no game for couples. You both answer privately; only the things you're BOTH into are revealed. No awkward asking, no exposed nos.",
  path: "/desire-matcher",
});

export default function DesireMatcherPage() {
  return (
    <section className="relative flex min-h-[calc(100dvh-4rem)] flex-col overflow-hidden py-6">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 60% at 50% 22%, #2a0a18 0%, #1a0710 55%, #0d040a 100%)",
        }}
      />
      <div className="relative mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-center px-4 sm:px-6">
        <header className="mb-5 text-center">
          <p className="text-xs font-medium tracking-[0.25em] text-[#ff8fae] uppercase">
            Red Zone · 18+
          </p>
          <h1 className="mt-1 font-display text-2xl text-white sm:text-3xl">
            Desire Matcher
          </h1>
        </header>
        <MatcherExperience />
      </div>
    </section>
  );
}
