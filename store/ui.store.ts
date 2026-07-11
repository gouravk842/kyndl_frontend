import { create } from "zustand";

interface UiState {
  sidebarOpen: boolean;
  commandPaletteOpen: boolean;
  /** Which dashboard library category the sidebar + workspace are showing.
   *  null = "no explicit pick yet" → consumers default to the first category. */
  dashboardCategory: string | null;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  setCommandPaletteOpen: (open: boolean) => void;
  toggleCommandPalette: () => void;
  setDashboardCategory: (key: string) => void;
}

export const useUiStore = create<UiState>()((set) => ({
  sidebarOpen: true,
  commandPaletteOpen: false,
  dashboardCategory: null,
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setCommandPaletteOpen: (commandPaletteOpen) => set({ commandPaletteOpen }),
  toggleCommandPalette: () =>
    set((s) => ({ commandPaletteOpen: !s.commandPaletteOpen })),
  setDashboardCategory: (dashboardCategory) => set({ dashboardCategory }),
}));
