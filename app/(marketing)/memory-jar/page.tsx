import { MemoryJarExperience } from "@/features/memory-jar/components/memory-jar-experience";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Memory Jar",
  description:
    "A handcrafted glass jar full of folded notes — open any one to read a little message written just for you. A warm, intimate digital keepsake.",
  path: "/memory-jar",
});

export default function MemoryJarPage() {
  return (
    <section className="relative flex min-h-[calc(100dvh-4rem)] flex-col overflow-hidden py-6">
      {/* warm surface — a cozy table caught in candlelight */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(160deg, #fdf3e7 0%, #f5e0c3 60%, #ead5b0 100%)",
        }}
      />
      {/* soft grain so the surface feels tactile */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.04] mix-blend-multiply"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />

      <div className="relative mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-center px-4 sm:px-6">
        <header className="mb-3 text-center">
          <p className="text-xs font-medium tracking-[0.2em] text-[#C75B39] uppercase">
            A keepsake
          </p>
          <h1 className="mt-1 font-display text-2xl text-[#3A2A25] sm:text-3xl">
            Your memory jar
          </h1>
        </header>

        <MemoryJarExperience />
      </div>
    </section>
  );
}
