import {
  ExperienceGallery,
  FinalCta,
  HeroSection,
  HowItWorks,
  Testimonials,
} from "@/components/landing";
import { createMetadata } from "@/lib/seo";
import { getFeaturedExperiencesView } from "@/lib/server/experiences";

export const metadata = createMetadata({
  title: "Moments made to be felt",
  description:
    "Kyndl turns what you feel into keepsakes they can hold — a page-turning scrapbook, a night sky of your moments, a jar of little notes, and more. Personalized in minutes.",
  path: "/",
});

export default async function HomePage() {
  const featured = await getFeaturedExperiencesView();
  return (
    <>
      {/* A tight funnel: feel it → see the real experiences → how it works →
          proof → act. The old generic "scratch/card/blur" demo was removed —
          it showed gimmicks, not the actual products the gallery already sells. */}
      <HeroSection />
      <ExperienceGallery experiences={featured} />
      <HowItWorks />
      <Testimonials />
      <FinalCta />
    </>
  );
}
