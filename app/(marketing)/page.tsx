import {
  CreateKeepsakeFab,
  ExperienceGallery,
  HeroSection,
  HowItWorks,
  MemoryBankSpotlight,
  PlayAndNight,
  Testimonials,
} from "@/components/landing";
import { createMetadata } from "@/lib/seo";
import { getFeaturedExperiencesView } from "@/lib/server/experiences";
import { getApprovedTestimonials } from "@/lib/server/testimonials";

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
