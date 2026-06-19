import { apiRequest } from "@/services/api/client";
import type { ApiResponse } from "@/types/api";
import type {
  AuthSession,
  AuthTokens,
  LoginCredentials,
  RegisterPayload,
} from "@/types/auth";
import type { User } from "@/types/user";

const AUTH_BASE = "/auth";

export const authService = {
  login(credentials: LoginCredentials) {
    return apiRequest<ApiResponse<AuthSession>>({
      method: "POST",
      url: `${AUTH_BASE}/login`,
      data: credentials,
    });
  },

  register(payload: RegisterPayload) {
    return apiRequest<ApiResponse<AuthSession>>({
      method: "POST",
      url: `${AUTH_BASE}/register`,
      data: payload,
    });
  },

  logout() {
    return apiRequest<ApiResponse<null>>({
      method: "POST",
      url: `${AUTH_BASE}/logout`,
    });
  },

  refreshToken() {
    return apiRequest<AuthTokens>({
      method: "POST",
      url: `${AUTH_BASE}/refresh`,
    });
  },

  getProfile() {
    return apiRequest<ApiResponse<User>>({
      method: "GET",
      url: `${AUTH_BASE}/me`,
    });
  },
};
