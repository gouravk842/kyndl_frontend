import { Suspense } from "react";

import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { PageContainer } from "@/components/layout/page-container";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { SiteSettingsProvider } from "@/components/site-settings/site-settings-provider";
import { CreationWorkspaceHeader } from "@/features/dashboard/components/creation-workspace-header";
import { DashboardHeaderActions } from "@/features/dashboard/components/dashboard-header-actions";
import { CartButton } from "@/features/gifts/components/cart-button";
import { NotificationBell } from "@/features/notifications/components/notification-bell";
import { getSiteSettings } from "@/lib/server/site-settings";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const siteSettings = await getSiteSettings();
  const showCart = siteSettings.show_cart && siteSettings.show_gifts;

  return (
    <SiteSettingsProvider value={siteSettings}>
      <div className="flex h-screen overflow-hidden">
        <DashboardSidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex h-16 shrink-0 items-center justify-between border-b px-6">
            <Suspense fallback={<div />}>
              <CreationWorkspaceHeader />
            </Suspense>
            <div className="flex items-center gap-1 sm:gap-2">
              {showCart ? <CartButton /> : null}
              <NotificationBell />
              <ThemeToggle />
              <Suspense fallback={<div className="size-9" />}>
                <DashboardHeaderActions />
              </Suspense>
            </div>
          </header>
          <main className="flex-1 overflow-auto p-6">
            <PageContainer size="full" className="px-0">
              {children}
            </PageContainer>
          </main>
        </div>
      </div>
    </SiteSettingsProvider>
  );
}
