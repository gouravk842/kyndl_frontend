"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Logo } from "@/components/shared/logo";
import { ROUTES } from "@/constants/routes";
import { WaxSeal } from "@/features/auth/components/keepsake-props";

/** Contextual sign-in ↔ create-account switch, keyed off the current route. */
function useAuthSwitch() {
  const pathname = usePathname();
  if (pathname?.startsWith(ROUTES.register)) {
    return {
      prompt: "Already a member?",
      label: "Sign in",
      href: ROUTES.login,
    };
  }
  return {
    prompt: "New to Kyndl?",
    label: "Create account",
    href: ROUTES.register,
  };
}

export function AuthHeader() {
  const { prompt, label, href } = useAuthSwitch();

  return (
    <header className="relative z-20 flex items-center justify-between gap-4 px-5 py-5 sm:px-8">
      <div className="flex items-center gap-4">
        <Logo />
        <WaxSeal className="hidden size-9 sm:block" aria-hidden />
        <Link
          href={ROUTES.home}
          className="hidden items-center gap-1.5 font-cursive text-[19px] text-[#7A6258] transition-colors hover:text-[#3A2A25] sm:inline-flex"
        >
          <span aria-hidden>←</span>
          Back to home
        </Link>
      </div>

      <div className="flex items-center gap-3 text-sm">
        <span className="hidden text-[#7A6258] sm:inline">{prompt}</span>
        <Link
          href={href}
          className="font-cursive text-[19px] text-[#C75B39] underline underline-offset-4 transition-opacity hover:opacity-80"
        >
          {label}
        </Link>
      </div>
    </header>
  );
}
