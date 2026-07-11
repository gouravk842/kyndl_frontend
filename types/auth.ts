import type { User } from "@/types/user";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  first_name: string;
  last_name: string;
  password: string;
  password_confirm: string;
}

/** Response from signup — no session yet; an OTP was emailed. */
export interface SignupResult {
  detail: string;
  email: string;
}

export interface VerifyEmailPayload {
  email: string;
  otp: string;
}

export interface ResendOtpPayload {
  email: string;
}

export interface PasswordResetRequestPayload {
  email: string;
}

export interface PasswordResetConfirmPayload {
  email: string;
  otp: string;
  new_password: string;
  new_password_confirm: string;
}

/** Shape returned by the BFF for session-establishing calls. */
export interface AuthSession {
  user: User;
}
