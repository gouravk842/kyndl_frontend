import { Suspense } from "react";

import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { PageContainer } from "@/components/layout/page-container";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { CreationWorkspaceHeader } from "@/features/dashboard/components/creation-workspace-header";
import { DashboardHeaderActions } from "@/features/dashboard/components/dashboard-header-actions";
import { NotificationBell } from "@/features/notifications/components/notification-bell";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden">
      <DashboardSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 shrink-0 items-center justify-between border-b px-6">
          <Suspense fallback={<div />}>
            <CreationWorkspaceHeader />
          </Suspense>
          <div className="flex items-center gap-2">
            <NotificationBell />
            <ThemeToggle />
            <DashboardHeaderActions />
          </div>
        </header>
        <main className="flex-1 overflow-auto p-6">
          <PageContainer size="full" className="px-0">
            {children}
          </PageContainer>
        </main>
      </div>
    </div>
  );
}
