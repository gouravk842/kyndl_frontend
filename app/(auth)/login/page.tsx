import { Suspense } from "react";

import { LoginForm } from "@/features/auth/components/login-form";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Sign in",
  description: "Sign in to your Kyndl Memory Bank",
  path: "/login",
  noIndex: true,
});

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
