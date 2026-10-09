"use client";

import type { ReactNode } from "react";

import { PageViewTracker } from "@/components/analytics/page-view-tracker";
import { Toaster } from "@/components/ui/sonner";
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
        <PageViewTracker />
        <Toaster richColors closeButton position="top-right" />
      </QueryProvider>
    </ThemeProvider>
  );
}
