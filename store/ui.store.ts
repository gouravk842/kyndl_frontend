import { create } from "zustand";

interface UiState {
  sidebarOpen: boolean;
  commandPaletteOpen: boolean;
  reportProblemOpen: boolean;
  /** Which dashboard library category the sidebar + workspace are showing.
   *  null = "no explicit pick yet" → consumers default to the first category. */
  dashboardCategory: string | null;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  setCommandPaletteOpen: (open: boolean) => void;
  toggleCommandPalette: () => void;
  setReportProblemOpen: (open: boolean) => void;
  openReportProblem: () => void;
  setDashboardCategory: (key: string) => void;
}

export const useUiStore = create<UiState>()((set) => ({
  sidebarOpen: true,
  commandPaletteOpen: false,
  reportProblemOpen: false,
  dashboardCategory: null,
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setCommandPaletteOpen: (commandPaletteOpen) => set({ commandPaletteOpen }),
  toggleCommandPalette: () =>
    set((s) => ({ commandPaletteOpen: !s.commandPaletteOpen })),
  setReportProblemOpen: (reportProblemOpen) => set({ reportProblemOpen }),
  openReportProblem: () => set({ reportProblemOpen: true }),
  setDashboardCategory: (dashboardCategory) => set({ dashboardCategory }),
}));
