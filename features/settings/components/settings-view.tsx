"use client";

import { LogOut } from "lucide-react";
import Link from "next/link";

import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { NotificationSettings } from "@/features/notifications/components/notification-settings";
import { useAuth } from "@/hooks/use-auth";
import { formatDateLocal } from "@/lib/datetime";

export function SettingsView() {
  const { profile, logout, isLoggingOut } = useAuth();
  const displayName = profile?.full_name?.trim() || "Your account";
  const providers = profile?.linked_providers ?? [];

  return (
    <>
      <PageHeader
        compact
        eyebrow="Account"
        title="Settings"
        subtitle="Your profile and how Kyndl reaches you."
      />

      <PageContainer size="lg" className="space-y-10 py-10 md:py-14">
        <section className="rounded-3xl border border-[#F4DDD0] bg-white px-5 py-5 md:px-6">
          <h3 className="text-sm font-semibold text-[#3A2A25]">Profile</h3>
          <p className="mt-1 text-xs text-[#7A6258]">
            Details from your Kyndl account.
          </p>
          <dl className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-xs text-[#B08C7D]">Name</dt>
              <dd className="mt-0.5 text-sm font-medium text-[#3A2A25]">
                {displayName}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-[#B08C7D]">Email</dt>
              <dd className="mt-0.5 text-sm font-medium text-[#3A2A25]">
                {profile?.email ?? "—"}
              </dd>
            </div>
            {profile?.date_joined && (
              <div>
                <dt className="text-xs text-[#B08C7D]">Member since</dt>
                <dd className="mt-0.5 text-sm font-medium text-[#3A2A25]">
                  {formatDateLocal(profile.date_joined)}
                </dd>
              </div>
            )}
            {providers.length > 0 && (
              <div>
                <dt className="text-xs text-[#B08C7D]">Linked sign-in</dt>
                <dd className="mt-0.5 text-sm font-medium text-[#3A2A25] capitalize">
                  {providers.join(", ")}
                </dd>
              </div>
            )}
          </dl>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <Button
              variant="outline"
              render={<Link href={ROUTES.forgotPassword} />}
            >
              Reset password
            </Button>
            <Button
              variant="ghost"
              onClick={() => logout()}
              disabled={isLoggingOut}
              className="text-destructive hover:text-destructive"
            >
              <LogOut className="size-4" />
              Sign out
            </Button>
          </div>
        </section>

        <section className="rounded-3xl border border-[#F4DDD0] bg-white px-5 py-5 md:px-6">
          <NotificationSettings />
        </section>
      </PageContainer>
    </>
  );
}
