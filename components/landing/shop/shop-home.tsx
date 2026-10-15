import dynamic from "next/dynamic";

import { ShopCategories } from "@/components/landing/shop/shop-categories";
import { ShopCta } from "@/components/landing/shop/shop-cta";
import { ShopFeatured } from "@/components/landing/shop/shop-featured";
import { ShopHero } from "@/components/landing/shop/shop-hero";
import { ShopHowItWorks } from "@/components/landing/shop/shop-how-it-works";
import { ShopKeepsakesRail } from "@/components/landing/shop/shop-keepsakes-rail";
import { ShopOccasions } from "@/components/landing/shop/shop-occasions";
import { ShopPromise } from "@/components/landing/shop/shop-promise";
import type { ExperienceView } from "@/lib/experience-catalog";
import type { SiteSettings } from "@/lib/site-settings";
import type { GiftProduct, ProductCategory } from "@/types/gift";
import type { Testimonial } from "@/types/testimonial";

const Testimonials = dynamic(() =>
  import("@/components/landing/testimonials").then((m) => m.Testimonials),
);

/**
 * V2 ecommerce homepage — standard boutique storefront composition.
 */
export function ShopHome({
  products,
  categories,
  experiences,
  testimonials,
  settings,
}: {
  products: GiftProduct[];
  categories: ProductCategory[];
  experiences: ExperienceView[];
  testimonials: Testimonial[];
  settings: SiteSettings;
}) {
  return (
    <>
      <ShopHero />
      {settings.show_gifts ? (
        <>
          <ShopCategories categories={categories} />
          <ShopFeatured products={products} />
          <ShopOccasions />
        </>
      ) : null}
      <ShopPromise />
      <ShopHowItWorks />
      {settings.show_experiences ? (
        <ShopKeepsakesRail experiences={experiences} />
      ) : null}
      {testimonials.length > 0 ? <Testimonials items={testimonials} /> : null}
      {settings.show_gifts ? <ShopCta /> : null}
    </>
  );
}
