import { apiRequest } from "@/services/api/client";
import type {
  AuthSession,
  LoginCredentials,
  PasswordResetConfirmPayload,
  PasswordResetRequestPayload,
  RegisterPayload,
  ResendOtpPayload,
  SignupResult,
  VerifyEmailPayload,
} from "@/types/auth";

// All calls hit the same-origin Next BFF (`/api` baseURL on apiClient), which
// proxies to Django and manages the httpOnly auth cookies.
const AUTH_BASE = "/auth";

export const authService = {
  // Registers the account and triggers an OTP email. No session yet.
  signup(payload: RegisterPayload) {
    return apiRequest<SignupResult>({
      method: "POST",
      url: `${AUTH_BASE}/signup`,
      data: payload,
    });
  },

  // Verifies the signup OTP; the BFF sets the auth cookies and returns the user.
  verifyEmail(payload: VerifyEmailPayload) {
    return apiRequest<AuthSession>({
      method: "POST",
      url: `${AUTH_BASE}/verify-email`,
      data: payload,
    });
  },

  resendOtp(payload: ResendOtpPayload) {
    return apiRequest<{ detail: string }>({
      method: "POST",
      url: `${AUTH_BASE}/resend-otp`,
      data: payload,
    });
  },

  login(credentials: LoginCredentials) {
    return apiRequest<AuthSession>({
      method: "POST",
      url: `${AUTH_BASE}/login`,
      data: credentials,
    });
  },

  logout() {
    return apiRequest<{ ok: true }>({
      method: "POST",
      url: `${AUTH_BASE}/logout`,
    });
  },

  // Rotates the httpOnly cookies server-side; success is signalled by 2xx.
  refreshToken() {
    return apiRequest<{ ok: true }>({
      method: "POST",
      url: `${AUTH_BASE}/refresh`,
    });
  },

  getProfile() {
    return apiRequest<AuthSession>({
      method: "GET",
      url: `${AUTH_BASE}/me`,
    });
  },

  requestPasswordReset(payload: PasswordResetRequestPayload) {
    return apiRequest<{ detail: string }>({
      method: "POST",
      url: `${AUTH_BASE}/password-reset`,
      data: payload,
    });
  },

  confirmPasswordReset(payload: PasswordResetConfirmPayload) {
    return apiRequest<{ detail: string }>({
      method: "POST",
      url: `${AUTH_BASE}/password-reset/confirm`,
      data: payload,
    });
  },
};
