import { Suspense } from "react";

import { VerifyEmailForm } from "@/features/auth/components/verify-email-form";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Verify email",
  description: "Verify your Kyndl account email",
  path: "/verify-email",
  noIndex: true,
});

export default function VerifyEmailPage() {
  // useSearchParams (inside the form) must sit under a Suspense boundary.
  return (
    <Suspense>
      <VerifyEmailForm />
    </Suspense>
  );
}
