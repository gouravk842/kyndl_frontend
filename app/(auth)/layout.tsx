import { Suspense } from "react";

import { AmbientBackground } from "@/components/landing/ambient-background";
import { AuthHeader } from "@/components/layout/auth-header";
import { AuthBrandPanel } from "@/features/auth/components/auth-brand-panel";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-dvh flex-col overflow-x-hidden bg-[#FFF7F1] text-[#3A2A25] lg:h-dvh lg:overflow-hidden">
      <AmbientBackground />
      <Suspense>
        <AuthHeader />
      </Suspense>
      <main className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden px-4 py-6 sm:px-8 lg:py-5">
        <div className="grid w-full max-w-5xl items-center gap-8 lg:h-full lg:grid-cols-2 lg:items-stretch lg:gap-8">
          <AuthBrandPanel />
          <div className="flex min-h-0 items-center justify-center lg:h-full">
            <div className="w-full max-w-md lg:h-full">{children}</div>
          </div>
        </div>
      </main>
    </div>
  );
}
