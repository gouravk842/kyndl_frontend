import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from "axios";

import { normalizeApiError } from "@/services/api/errors";

type RetryableConfig = InternalAxiosRequestConfig & { _retry?: boolean };

let refreshPromise: Promise<boolean> | null = null;

/**
 * The browser talks only to the same-origin Next BFF (`/api/*`), never to
 * Django directly. The BFF stores the JWTs as `httpOnly; Secure; SameSite`
 * cookies, which the browser attaches automatically via `withCredentials`. The
 * frontend never reads or writes these tokens — that is what protects them from
 * XSS. Server-side, the BFF forwards them to Django as bearer tokens.
 */
export const apiClient: AxiosInstance = axios.create({
  baseURL: "/api",
  timeout: 30_000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  withCredentials: true,
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
        const refreshed = await refreshAccessToken();
        if (refreshed) {
          // The refresh endpoint set a fresh access-token cookie; retry.
          return apiClient(originalRequest);
        }
      } catch {
        // Fall through to reject.
      }
    }

    return Promise.reject(normalizeApiError(error));
  },
);

/**
 * Single-flight token refresh: concurrent 401s share one refresh call so we
 * never fire multiple `/auth/refresh` requests. The backend rotates the cookies
 * on success; we only need to know whether it succeeded.
 */
async function refreshAccessToken(): Promise<boolean> {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      const { authService } = await import("@/services/auth/auth.service");
      await authService.refreshToken();
      return true;
    })()
      .catch(() => false)
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

export async function apiRequest<T>(config: AxiosRequestConfig): Promise<T> {
  const response = await apiClient.request<T>(config);
  return response.data;
}
