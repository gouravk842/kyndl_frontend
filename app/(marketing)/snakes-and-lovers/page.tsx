import { SnakesAndLoversExperience } from "@/features/snakes-and-lovers/components/snakes-and-lovers-experience";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Snakes & Lovers",
  description:
    "An adults-only Snakes & Ladders for couples — a dare on every square, ladders rush you hotter, snakes tease you back, and first to 100 directs the finale. Fully customizable, privately shared.",
  path: "/snakes-and-lovers",
});

export default function SnakesAndLoversPage() {
  return (
    <section className="relative flex min-h-[calc(100dvh-4rem)] flex-col overflow-hidden py-6">
      {/* dim, candlelit Red Zone surface */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 60% at 50% 22%, #2a0a18 0%, #1a0710 55%, #0d040a 100%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.05] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />

      <div className="relative mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-center px-4 sm:px-6">
        <header className="mb-5 text-center">
          <p className="text-xs font-medium tracking-[0.25em] text-[#ff8fae] uppercase">
            Red Zone · 18+
          </p>
          <h1 className="mt-1 font-display text-2xl text-white sm:text-3xl">
            Snakes & Lovers
          </h1>
        </header>

        <SnakesAndLoversExperience />
      </div>
    </section>
  );
}
