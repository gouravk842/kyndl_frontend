import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from "axios";

import {
  getLastRequestId,
  rememberRequestId,
  reportError,
} from "@/lib/report-error";
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

apiClient.interceptors.request.use((config) => {
  const requestId = crypto.randomUUID();
  config.headers["X-Request-ID"] = requestId;
  rememberRequestId(requestId);
  return config;
});

function echoRequestId(headers: unknown): void {
  if (!headers || typeof headers !== "object") return;
  const raw = (headers as { "x-request-id"?: string })["x-request-id"];
  if (raw) rememberRequestId(raw);
}

apiClient.interceptors.response.use(
  (response) => {
    echoRequestId(response.headers);
    return response;
  },
  async (error) => {
    const originalRequest = error.config as RetryableConfig | undefined;

    // Never refresh-and-retry the refresh call itself. A 401 from /auth/refresh
    // means there is no session; waiting on another refresh deadlocks the
    // original request and leaves the header stuck.
    const isRefreshCall = originalRequest?.url?.includes("/auth/refresh");
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !isRefreshCall
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

    echoRequestId(error.response?.headers);
    const normalized = normalizeApiError(error);
    // Server faults only — avoid noise from expected 4xx (validation, 402, etc.).
    if (normalized.status >= 500) {
      const path =
        typeof originalRequest?.url === "string"
          ? originalRequest.url.split("?")[0]
          : undefined;
      reportError(new Error(normalized.message), {
        boundary: "api",
        status: normalized.status,
        path,
        request_id: getLastRequestId(),
      });
    }

    return Promise.reject(normalized);
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
