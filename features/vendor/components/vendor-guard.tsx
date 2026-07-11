"use client";

import { Loader2, Store } from "lucide-react";

import { useAuth } from "@/hooks/use-auth";

/**
 * Wraps the shop dashboard. The route already requires login (proxy); this
 * additionally requires the vendor role, showing a friendly notice to shoppers
 * who don't have a shop. Vendors are admin-created, so there's nothing to
 * self-serve here.
 */
export function VendorGuard({ children }: { children: React.ReactNode }) {
  const { profile, isHydrated, isLoadingProfile } = useAuth();

  if (!isHydrated || isLoadingProfile) {
    return (
      <div className="flex justify-center py-24 text-muted-foreground">
        <Loader2 className="size-6 animate-spin" />
      </div>
    );
  }

  if (!profile?.is_vendor) {
    return (
      <div className="mx-auto max-w-md rounded-2xl border bg-card p-10 text-center">
        <Store className="mx-auto size-10 text-muted-foreground" />
        <h1 className="mt-4 font-display text-xl">You don&apos;t have a shop yet</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Shops on Kyndl are set up by our team. Reach out to us if you&apos;d like to sell
          your gifts here — we&apos;ll get you onboarded.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
