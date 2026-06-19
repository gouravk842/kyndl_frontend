import Link from "next/link";

import { Logo } from "@/components/shared/logo";
import { ROUTES } from "@/constants/routes";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-4 py-12">
      <Link href={ROUTES.home} className="mb-8">
        <Logo />
      </Link>
      {children}
    </div>
  );
}
