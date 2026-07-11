"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

import { queryKeys } from "@/constants/query-keys";
import { ROUTES } from "@/constants/routes";
import { postAuthDestination, withCallbackUrl } from "@/lib/navigation";
import { authService } from "@/services/auth/auth.service";
import { useAuthStore } from "@/store/auth.store";
import type { ApiError } from "@/types/api";
import type {
  LoginCredentials,
  PasswordResetConfirmPayload,
  PasswordResetRequestPayload,
  RegisterPayload,
  VerifyEmailPayload,
} from "@/types/auth";

function errorMessage(error: unknown, fallback: string): string {
  return (error as ApiError)?.message ?? fallback;
}

export function useAuth() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // Where proxy.ts (or a "Sign in to save" link) wanted the user to end up.
  // Preserved through the whole auth flow so login/verify returns them there.
  const callbackUrl = searchParams.get("callbackUrl");
  const queryClient = useQueryClient();
  const { user, isAuthenticated, isHydrated, setUser, clearAuth } =
    useAuthStore();

  const profileQuery = useQuery({
    queryKey: queryKeys.auth.profile(),
    queryFn: async () => {
      const res = await authService.getProfile();
      setUser(res.user);
      return res.user;
    },
    enabled: isAuthenticated && isHydrated,
    staleTime: 5 * 60 * 1000,
  });

  const loginMutation = useMutation({
    mutationFn: (credentials: LoginCredentials) =>
      authService.login(credentials),
    onSuccess: (res) => {
      // Tokens are stored as httpOnly cookies by the BFF; we only keep the user
      // in client state for rendering.
      setUser(res.user);
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.all });
      toast.success("Welcome back!");
      router.push(postAuthDestination(callbackUrl));
    },
    onError: (error) => {
      toast.error(errorMessage(error, "Login failed"));
    },
  });

  const signupMutation = useMutation({
    mutationFn: (payload: RegisterPayload) => authService.signup(payload),
    onSuccess: (res) => {
      // No session yet — an OTP was emailed. Move to the verification step,
      // carrying the callbackUrl so the post-verify redirect lands on target.
      toast.success("Check your email for a verification code.");
      router.push(
        withCallbackUrl(
          `${ROUTES.verifyEmail}?email=${encodeURIComponent(res.email)}`,
          callbackUrl,
        ),
      );
    },
    onError: (error) => {
      toast.error(errorMessage(error, "Registration failed"));
    },
  });

  const verifyEmailMutation = useMutation({
    mutationFn: (payload: VerifyEmailPayload) =>
      authService.verifyEmail(payload),
    onSuccess: (res) => {
      setUser(res.user);
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.all });
      toast.success("Email verified — welcome to Kyndl!");
      router.push(postAuthDestination(callbackUrl));
    },
    onError: (error) => {
      toast.error(errorMessage(error, "Verification failed"));
    },
  });

  const resendOtpMutation = useMutation({
    mutationFn: (email: string) => authService.resendOtp({ email }),
    onSuccess: () => {
      toast.success("A new code is on its way.");
    },
    onError: (error) => {
      toast.error(errorMessage(error, "Could not resend the code"));
    },
  });

  const requestResetMutation = useMutation({
    mutationFn: (payload: PasswordResetRequestPayload) =>
      authService.requestPasswordReset(payload),
    onError: (error) => {
      toast.error(errorMessage(error, "Could not send reset code"));
    },
  });

  const confirmResetMutation = useMutation({
    mutationFn: (payload: PasswordResetConfirmPayload) =>
      authService.confirmPasswordReset(payload),
    onSuccess: () => {
      toast.success("Password reset. Please sign in.");
      router.push(ROUTES.login);
    },
    onError: (error) => {
      toast.error(errorMessage(error, "Could not reset password"));
    },
  });

  const logoutMutation = useMutation({
    mutationFn: () => authService.logout(),
    onSettled: () => {
      // The BFF clears the httpOnly cookies; we just reset client state.
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
    isLoggingIn: loginMutation.isPending,
    signup: signupMutation.mutate,
    isSigningUp: signupMutation.isPending,
    verifyEmail: verifyEmailMutation.mutate,
    isVerifying: verifyEmailMutation.isPending,
    resendOtp: resendOtpMutation.mutate,
    isResendingOtp: resendOtpMutation.isPending,
    requestPasswordReset: requestResetMutation.mutate,
    isRequestingReset: requestResetMutation.isPending,
    confirmPasswordReset: confirmResetMutation.mutate,
    isConfirmingReset: confirmResetMutation.isPending,
    logout: logoutMutation.mutate,
    isLoggingOut: logoutMutation.isPending,
  };
}
