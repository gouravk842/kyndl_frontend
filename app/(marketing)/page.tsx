import {
  ExperienceStrip,
  FinalCta,
  GiftCatalog,
  HeroSection,
  HowItWorks,
  InteractiveShowcase,
  Testimonials,
} from "@/components/landing";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Moments made to be felt",
  description:
    "Kyndl is an emotional experience platform — digital love cards, hidden messages, couple games, and curated surprises designed to deepen connection.",
  path: "/",
});

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <ExperienceStrip />
      <GiftCatalog />
      <InteractiveShowcase />
      <HowItWorks />
      <Testimonials />
      <FinalCta />
    </>
  );
}
