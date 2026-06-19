import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { PageContainer } from "@/components/layout/page-container";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { DashboardHeaderActions } from "@/features/dashboard/components/dashboard-header-actions";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <DashboardSidebar />
      <div className="flex flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b px-6">
          <div />
          <div className="flex items-center gap-2">
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
