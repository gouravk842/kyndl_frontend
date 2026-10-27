import dynamic from "next/dynamic";

import { CreateKeepsakeFab } from "@/components/landing/create-keepsake-fab";
import { ExperienceGallery } from "@/components/landing/experience-gallery";
import { HeroSection } from "@/components/landing/hero-section";
import { HowItWorks } from "@/components/landing/how-it-works";
import { MemoryBankSpotlight } from "@/components/landing/memory-bank-spotlight";
import { ShopHome } from "@/components/landing/shop/shop-home";
import { createMetadata } from "@/lib/seo";
import { getFeaturedExperiencesView } from "@/lib/server/experiences";
import { getGiftCatalog, getGiftCategories } from "@/lib/server/gifts";
import { getSiteSettings } from "@/lib/server/site-settings";
import { getApprovedTestimonials } from "@/lib/server/testimonials";

const PlayAndNight = dynamic(() =>
  import("@/components/landing/play-and-night").then((m) => m.PlayAndNight),
);

const Testimonials = dynamic(() =>
  import("@/components/landing/testimonials").then((m) => m.Testimonials),
);

// Public catalog fetches ISR for 60s (site-settings, pricing, gifts, testimonials).
export const revalidate = 60;

export async function generateMetadata() {
  const settings = await getSiteSettings();
  if (settings.site_mode === "v2") {
    return createMetadata({
      title: "Shop gifts & jewellery",
      description:
        "A boutique for jewellery, keepsakes, and thoughtful gifts — curated to feel personal, ready to wrap and ship.",
      path: "/",
    });
  }
  return createMetadata({
    title: "Moments made to be felt",
    description:
      "Keep the days in a Memory Bank, then grow them into a scrapbook, a night sky, a jar of notes — or craft any Kyndl experience on its own. Personalized in minutes.",
    path: "/",
  });
}

export default async function HomePage() {
  const settings = await getSiteSettings();

  if (settings.site_mode === "v2") {
    const [products, categories, featured, testimonials] = await Promise.all([
      settings.show_gifts ? getGiftCatalog() : Promise.resolve([]),
      settings.show_gifts ? getGiftCategories() : Promise.resolve([]),
      settings.show_experiences
        ? getFeaturedExperiencesView()
        : Promise.resolve([]),
      getApprovedTestimonials(),
    ]);

    return (
      <ShopHome
        products={products}
        categories={categories}
        experiences={featured}
        testimonials={testimonials}
        settings={settings}
      />
    );
  }

  const [featured, testimonials] = await Promise.all([
    getFeaturedExperiencesView(),
    getApprovedTestimonials(),
  ]);

  const showGallery = settings.show_experiences;
  const showBankSpotlight =
    settings.show_memory_bank && settings.show_memory_bank_spotlight;
  const showPlay = settings.show_play_and_night;

  return (
    <>
      <HeroSection />
      {showBankSpotlight ? <MemoryBankSpotlight /> : null}
      {showGallery ? <ExperienceGallery experiences={featured} /> : null}
      <HowItWorks />
      {showPlay ? <PlayAndNight /> : null}
      <Testimonials items={testimonials} />
      {showGallery || settings.show_gifts ? <CreateKeepsakeFab /> : null}
    </>
  );
}
