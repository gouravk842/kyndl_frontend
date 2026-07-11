"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import type { ReactNode } from "react";

import { ROUTES } from "@/constants/routes";
import { withCallbackUrl } from "@/lib/navigation";

/**
 * A link to the login page that remembers where the user is. Use for the
 * "Sign in to save" fallbacks inside builders: after authenticating, the user
 * is returned to the exact page (incl. `?id=`) they were editing, instead of
 * being dropped on the dashboard with their draft stranded.
 */
export function SignInLink({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const search = useSearchParams().toString();
  const callbackUrl = search ? `${pathname}?${search}` : pathname;
  return (
    <Link href={withCallbackUrl(ROUTES.login, callbackUrl)} className={className}>
      {children}
    </Link>
  );
}
