"use client";

import type { ReactNode } from "react";

import { PageViewTracker } from "@/components/analytics/page-view-tracker";
import { NavigationProgress } from "@/components/layout/navigation-progress";
import { Toaster } from "@/components/ui/sonner";
import { ReportProblemSheet } from "@/features/issues/components/report-problem-sheet";
import { AuthSessionSync } from "@/providers/auth-session-sync";
import { QueryProvider } from "@/providers/query-provider";
import { ThemeProvider } from "@/providers/theme-provider";

interface AppProvidersProps {
  children: ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <ThemeProvider>
      <QueryProvider>
        <AuthSessionSync />
        {children}
        <ReportProblemSheet />
        <PageViewTracker />
        <NavigationProgress />
        <Toaster richColors closeButton position="top-right" />
      </QueryProvider>
    </ThemeProvider>
  );
}
