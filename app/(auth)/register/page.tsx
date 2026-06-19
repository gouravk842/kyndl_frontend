import { RegisterForm } from "@/features/auth/components/register-form";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Create account",
  description: "Create your Kyndl account",
  path: "/register",
  noIndex: true,
});

export default function RegisterPage() {
  return <RegisterForm />;
}
