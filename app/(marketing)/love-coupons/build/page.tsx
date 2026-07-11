import { Suspense } from "react";

import { CouponBookBuilder } from "@/features/love-coupons/components/builder/coupon-book-builder";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Build your Love Coupons",
  description:
    "Write your own redeemable love coupons, then share the booklet privately. They cash one in, you get pinged — the customizable, adults-only coupon book for two.",
  path: "/love-coupons/build",
});

export default function LoveCouponsBuildPage() {
  // The builder reads `?id=` via the sync hook, so it needs a Suspense boundary.
  return (
    <Suspense fallback={null}>
      <CouponBookBuilder />
    </Suspense>
  );
}
