"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { env } from "@/config/env";
import { COOKIE_MAX_AGE, COOKIE_NAMES } from "@/constants/cookies";
import { queryKeys } from "@/constants/query-keys";
import { ROUTES } from "@/constants/routes";
import { authService } from "@/services/auth/auth.service";
import { useAuthStore } from "@/store/auth.store";
import type { LoginCredentials, RegisterPayload } from "@/types/auth";
import { removeCookie, setCookie } from "@/utils/cookies";

function persistTokens(accessToken: string, refreshToken: string) {
  setCookie(COOKIE_NAMES.ACCESS_TOKEN, accessToken, {
    maxAge: COOKIE_MAX_AGE.ACCESS,
    secure: env.isProd,
  });
  setCookie(COOKIE_NAMES.REFRESH_TOKEN, refreshToken, {
    maxAge: COOKIE_MAX_AGE.REFRESH,
    secure: env.isProd,
  });
}

function clearTokens() {
  removeCookie(COOKIE_NAMES.ACCESS_TOKEN);
  removeCookie(COOKIE_NAMES.REFRESH_TOKEN);
}

export function useAuth() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, isAuthenticated, isHydrated, setUser, clearAuth } =
    useAuthStore();

  const profileQuery = useQuery({
    queryKey: queryKeys.auth.profile(),
    queryFn: async () => {
      const res = await authService.getProfile();
      return res.data;
    },
    enabled: isAuthenticated && isHydrated,
    staleTime: 5 * 60 * 1000,
  });

  const loginMutation = useMutation({
    mutationFn: (credentials: LoginCredentials) =>
      authService.login(credentials),
    onSuccess: (res) => {
      const { user, tokens } = res.data;
      persistTokens(tokens.accessToken, tokens.refreshToken);
      setUser(user);
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.all });
      toast.success("Welcome back!");
      router.push(ROUTES.dashboard);
    },
    onError: (error: { message?: string }) => {
      toast.error(error.message ?? "Login failed");
    },
  });

  const registerMutation = useMutation({
    mutationFn: (payload: RegisterPayload) => authService.register(payload),
    onSuccess: (res) => {
      const { user, tokens } = res.data;
      persistTokens(tokens.accessToken, tokens.refreshToken);
      setUser(user);
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.all });
      toast.success("Account created successfully");
      router.push(ROUTES.dashboard);
    },
    onError: (error: { message?: string }) => {
      toast.error(error.message ?? "Registration failed");
    },
  });

  const logoutMutation = useMutation({
    mutationFn: () => authService.logout(),
    onSettled: () => {
      clearTokens();
      clearAuth();
      queryClient.clear();
      router.push(ROUTES.login);
      toast.success("Signed out");
    },
  });

  return {
    user,
    isAuthenticated,
    isHydrated,
    profile: profileQuery.data ?? user,
    isLoadingProfile: profileQuery.isLoading,
    login: loginMutation.mutate,
    register: registerMutation.mutate,
    logout: logoutMutation.mutate,
    isLoggingIn: loginMutation.isPending,
    isRegistering: registerMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
  };
}
