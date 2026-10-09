"use client";

import { useEffect } from "react";

import { authService } from "@/services/auth/auth.service";
import { useAuthStore } from "@/store/auth.store";
import type { ApiError } from "@/types/api";

/**
 * The marketing header used to trust a name saved in localStorage, while
 * `/dashboard` trusts the httpOnly auth cookies. Those drift apart: the name
 * stays after logout, or the name shows when the dashboard will demand login.
 * This check makes the cookie session the only source of truth.
 */
export function AuthSessionSync() {
  useEffect(() => {
    // Older builds persisted `{ user, isAuthenticated }` under this key.
    try {
      localStorage.removeItem("kyndl-auth");
    } catch {
      // Private mode / blocked storage — the store no longer reads it.
    }

    let cancelled = false;
    const version = useAuthStore.getState().sessionVersion;

    (async () => {
      try {
        const res = await authService.getProfile();
        if (cancelled || useAuthStore.getState().sessionVersion !== version) {
          return;
        }
        if (!res.user) {
          useAuthStore.getState().clearAuth();
          return;
        }
        useAuthStore.getState().setUser(res.user);
      } catch (error) {
        if (cancelled || useAuthStore.getState().sessionVersion !== version) {
          return;
        }
        const status = (error as ApiError)?.status;
        if (status === 401) {
          useAuthStore.getState().clearAuth();
          return;
        }
        // Network/server failure: don't pretend a session exists.
        useAuthStore.getState().setHydrated(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
