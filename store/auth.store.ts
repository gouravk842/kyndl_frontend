import { create } from "zustand";

import type { User } from "@/types/user";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  /**
   * True once the cookie session has been checked (or the user just signed
   * in / out). Stays false on first paint so a leftover name cannot render
   * before we know the httpOnly cookies are actually valid.
   */
  isHydrated: boolean;
  /**
   * Bumped on sign-in and sign-out. In-flight profile requests capture the
   * value they started with and must not write a user back if it changed.
   */
  sessionVersion: number;
  setUser: (user: User | null) => void;
  setHydrated: (value: boolean) => void;
  clearAuth: () => void;
  /** Apply a profile response only if no sign-in/out happened while it was in flight. */
  commitUser: (user: User, version: number) => void;
}

export const useAuthStore = create<AuthState>()((set, get) => ({
  user: null,
  isAuthenticated: false,
  isHydrated: false,
  sessionVersion: 0,
  setUser: (user) =>
    set((state) => ({
      user,
      isAuthenticated: user !== null,
      isHydrated: true,
      sessionVersion: state.sessionVersion + 1,
    })),
  setHydrated: (isHydrated) => set({ isHydrated }),
  clearAuth: () =>
    set((state) => ({
      user: null,
      isAuthenticated: false,
      isHydrated: true,
      sessionVersion: state.sessionVersion + 1,
    })),
  commitUser: (user, version) => {
    if (get().sessionVersion !== version) return;
    set({ user, isAuthenticated: true, isHydrated: true });
  },
}));
