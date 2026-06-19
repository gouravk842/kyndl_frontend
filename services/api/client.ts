import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from "axios";

import { clientEnv, env } from "@/config/env";
import { COOKIE_NAMES } from "@/constants/cookies";
import { normalizeApiError } from "@/services/api/errors";
import { getCookie } from "@/utils/cookies";

type RetryableConfig = InternalAxiosRequestConfig & { _retry?: boolean };

let refreshPromise: Promise<string | null> | null = null;

export const apiClient: AxiosInstance = axios.create({
  baseURL: clientEnv.NEXT_PUBLIC_API_URL,
  timeout: 30_000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  withCredentials: true,
});

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getCookie(COOKIE_NAMES.ACCESS_TOKEN);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as RetryableConfig | undefined;

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        const newToken = await refreshAccessToken();
        if (newToken) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return apiClient(originalRequest);
        }
      } catch {
        // Fall through to reject
      }
    }

    return Promise.reject(normalizeApiError(error));
  },
);

async function refreshAccessToken(): Promise<string | null> {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      const { authService } = await import("@/services/auth/auth.service");
      const tokens = await authService.refreshToken();
      const { setCookie } = await import("@/utils/cookies");
      const { COOKIE_MAX_AGE } = await import("@/constants/cookies");
      setCookie(COOKIE_NAMES.ACCESS_TOKEN, tokens.accessToken, {
        maxAge: COOKIE_MAX_AGE.ACCESS,
        secure: env.isProd,
      });
      return tokens.accessToken;
    })().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

export async function apiRequest<T>(config: AxiosRequestConfig): Promise<T> {
  const response = await apiClient.request<T>(config);
  return response.data;
}
