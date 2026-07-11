"use client";

import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

import { ROUTES } from "@/constants/routes";
import { useAuthStore } from "@/store/auth.store";
import type { ApiError } from "@/types/api";

import { useAcceptInvite } from "../hooks/use-collaboration";

/**
 * Standalone invitation-accept screen. Accepting binds the seat to the signed-in
 * account whose email matches the invite, so this requires auth — the route sits
 * outside PUBLIC_ROUTES, so an unauthenticated visitor is bounced to sign in and
 * returns here. On mount it accepts once, then shows the outcome.
 */
export function AcceptInvite({ token }: { token: string }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const pathname = usePathname();
  const accept = useAcceptInvite();
  const attempted = useRef(false);

  useEffect(() => {
    if (!isHydrated || !isAuthenticated || attempted.current) return;
    attempted.current = true;
    accept.mutate(token);
  }, [isHydrated, isAuthenticated, token, accept]);

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-6 text-center">
      {isHydrated && !isAuthenticated ? (
        <Panel
          icon={<Loader2 className="size-8 animate-spin text-primary" />}
          title="Sign in to accept"
          body="You need to be signed in with the invited email address to accept."
          action={
            <Link
              href={`${ROUTES.login}?callbackUrl=${encodeURIComponent(pathname)}`}
              className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
            >
              Sign in
            </Link>
          }
        />
      ) : accept.isPending || !accept.isSuccess && !accept.isError ? (
        <Panel
          icon={<Loader2 className="size-8 animate-spin text-primary" />}
          title="Accepting your invitation…"
        />
      ) : accept.isSuccess ? (
        <Panel
          icon={<CheckCircle2 className="size-8 text-emerald-500" />}
          title="You're in!"
          body={
            accept.data.target
              ? `You can now collaborate on "${accept.data.target.name}" as ${accept.data.role}.`
              : `Invitation accepted — you joined as ${accept.data.role}.`
          }
          action={
            <Link
              href={ROUTES.dashboard}
              className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
            >
              Go to dashboard
            </Link>
          }
        />
      ) : (
        <Panel
          icon={<XCircle className="size-8 text-destructive" />}
          title="Couldn't accept this invitation"
          body={
            (accept.error as unknown as ApiError)?.message ??
            "This invitation may have been withdrawn, already used, or sent to a different email."
          }
          action={
            <Link
              href={ROUTES.dashboard}
              className="rounded-full border border-border px-5 py-2 text-sm font-semibold text-foreground hover:bg-muted"
            >
              Go to dashboard
            </Link>
          }
        />
      )}
    </div>
  );
}

function Panel({
  icon,
  title,
  body,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  body?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="space-y-4">
      <div className="flex justify-center">{icon}</div>
      <h1 className="text-2xl font-semibold text-foreground">{title}</h1>
      {body && <p className="text-sm text-muted-foreground">{body}</p>}
      {action && <div className="pt-2">{action}</div>}
    </div>
  );
}
