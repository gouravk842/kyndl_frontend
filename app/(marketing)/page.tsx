import dynamic from "next/dynamic";

import { CreateKeepsakeFab } from "@/components/landing/create-keepsake-fab";
import { ExperienceGallery } from "@/components/landing/experience-gallery";
import { HeroSection } from "@/components/landing/hero-section";
import { HowItWorks } from "@/components/landing/how-it-works";
import { MemoryBankSpotlight } from "@/components/landing/memory-bank-spotlight";
import { createMetadata } from "@/lib/seo";
import { getFeaturedExperiencesView } from "@/lib/server/experiences";
import { getApprovedTestimonials } from "@/lib/server/testimonials";

const PlayAndNight = dynamic(() =>
  import("@/components/landing/play-and-night").then((m) => m.PlayAndNight),
);

const Testimonials = dynamic(() =>
  import("@/components/landing/testimonials").then((m) => m.Testimonials),
);

export const metadata = createMetadata({
  title: "Moments made to be felt",
  description:
    "Keep the days in a Memory Bank, then grow them into a scrapbook, a night sky, a jar of notes — or craft any Kyndl experience on its own. Personalized in minutes.",
  path: "/",
});

export default async function HomePage() {
  const [featured, testimonials] = await Promise.all([
    getFeaturedExperiencesView(),
    getApprovedTestimonials(),
  ]);
  return (
    <>
      {/* Funnel: feel it → the bank → experiences → how → play/nights → proof. */}
      <HeroSection />
      <MemoryBankSpotlight />
      <ExperienceGallery experiences={featured} />
      <HowItWorks />
      <PlayAndNight />
      <Testimonials items={testimonials} />
      <CreateKeepsakeFab />
    </>
  );
}
