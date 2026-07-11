import { ForgotPasswordForm } from "@/features/auth/components/forgot-password-form";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Reset password",
  description: "Reset your Kyndl account password",
  path: "/forgot-password",
  noIndex: true,
});

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
