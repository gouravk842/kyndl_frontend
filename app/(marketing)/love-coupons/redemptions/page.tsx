import { Suspense } from "react";

import { OwnerRedemptions } from "@/features/love-coupons/components/redemptions/owner-redemptions";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Redemptions",
  description: "See which coupons your partner has cashed in.",
  path: "/love-coupons/redemptions",
});

export default function LoveCouponsRedemptionsPage() {
  return (
    <section className="relative min-h-[calc(100dvh-4rem)] overflow-hidden py-10">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 60% at 50% 0%, #2a0a18 0%, #1a0710 55%, #0d040a 100%)",
        }}
      />
      <div className="relative mx-auto flex w-full max-w-2xl justify-center px-4 sm:px-6">
        {/* OwnerRedemptions reads `?id=`, so it needs a Suspense boundary. */}
        <Suspense fallback={null}>
          <OwnerRedemptions />
        </Suspense>
      </div>
    </section>
  );
}
