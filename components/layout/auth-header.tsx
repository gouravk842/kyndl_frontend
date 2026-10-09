"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

import { KyndlButton } from "@/components/landing/kyndl-button";
import { Logo } from "@/components/shared/logo";
import { ROUTES } from "@/constants/routes";
import { withCallbackUrl } from "@/lib/navigation";

function useAuthSwitch() {
  const pathname = usePathname();
  const callbackUrl = useSearchParams().get("callbackUrl");
  if (pathname?.startsWith(ROUTES.register)) {
    return {
      prompt: "Already a member?",
      label: "Sign in",
      href: withCallbackUrl(ROUTES.login, callbackUrl),
    };
  }
  return {
    prompt: "New to Kyndl?",
    label: "Create account",
    href: withCallbackUrl(ROUTES.register, callbackUrl),
  };
}

export function AuthHeader() {
  const { prompt, label, href } = useAuthSwitch();

  return (
    <header className="relative z-20 shrink-0 border-b border-[#F2DACE]/80 bg-[#FFF7F1]/80 backdrop-blur-xl">
      <div className="flex h-14 items-center justify-between gap-4 px-5 sm:px-8 lg:h-16">
        <div className="flex items-center gap-4">
          <Logo className="[&_text]:fill-[#3A2A25]" />
          <Link
            href={ROUTES.home}
            className="hidden text-sm text-[#7A6258] transition-colors hover:text-[#3A2A25] sm:inline"
          >
            ← Back to home
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden text-sm text-[#7A6258] sm:inline">
            {prompt}
          </span>
          <KyndlButton href={href} size="default">
            {label}
          </KyndlButton>
        </div>
      </div>
    </header>
  );
}
