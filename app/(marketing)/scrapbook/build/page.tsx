import { BuilderExperience } from "@/features/scrapbook/components/builder/builder-experience";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Build your scrapbook",
  description:
    "Create a personalised digital scrapbook — add pages, photos, handwritten notes, keepsakes, and hidden messages, then preview it as a real flip-through book.",
  path: "/scrapbook/build",
});

export default function ScrapbookBuildPage() {
  return (
    <section className="relative py-3">
      <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-6">
        <header className="mb-2 flex flex-wrap items-baseline gap-x-3">
          <h1 className="font-display text-xl text-[#3A2A25]">
            Build a personalised scrapbook
          </h1>
          <p className="text-[11px] font-medium tracking-[0.2em] text-[#C75B39] uppercase">
            Make it yours
          </p>
        </header>

        <BuilderExperience />
      </div>
    </section>
  );
}
