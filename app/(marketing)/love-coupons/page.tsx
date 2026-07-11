import { CouponBookExperience } from "@/features/love-coupons/components/coupon-book-experience";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Love Coupons",
  description:
    "An adults-only booklet of redeemable love coupons for couples — write your own, share a private link, and let them cash one in any time. No expiry, fully customizable.",
  path: "/love-coupons",
});

export default function LoveCouponsPage() {
  return (
    <section className="relative flex min-h-[calc(100dvh-4rem)] flex-col overflow-hidden py-10">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 60% at 50% 0%, #2a0a18 0%, #1a0710 55%, #0d040a 100%)",
        }}
      />
      <div className="relative mx-auto flex w-full max-w-5xl flex-1 flex-col items-center px-4 sm:px-6">
        <p className="mb-5 text-xs font-medium tracking-[0.25em] text-[#ff8fae] uppercase">
          Red Zone · 18+
        </p>
        <CouponBookExperience />
      </div>
    </section>
  );
}
