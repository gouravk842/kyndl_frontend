"use client";

import { createContext, useContext } from "react";

import {
  DEFAULT_SITE_SETTINGS,
  isFeatureEnabled,
  type SiteFeatureKey,
  type SiteSettings,
} from "@/lib/site-settings";

const SiteSettingsContext = createContext<SiteSettings>(DEFAULT_SITE_SETTINGS);

export function SiteSettingsProvider({
  value,
  children,
}: {
  value: SiteSettings;
  children: React.ReactNode;
}) {
  return (
    <SiteSettingsContext.Provider value={value}>
      {children}
    </SiteSettingsContext.Provider>
  );
}

export function useSiteSettings(): SiteSettings {
  return useContext(SiteSettingsContext);
}

export function useSiteFeature(key: SiteFeatureKey): boolean {
  return isFeatureEnabled(useSiteSettings(), key);
}
