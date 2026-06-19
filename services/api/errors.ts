import type { AxiosError } from "axios";

import type { ApiError, ApiErrorBody } from "@/types/api";

export function normalizeApiError(error: unknown): ApiError {
  if (isAxiosErrorWithBody(error)) {
    const status = error.response?.status ?? 500;
    const body = error.response?.data;
    return {
      status,
      message: body?.message ?? error.message ?? "Request failed",
      code: body?.code,
      errors: body?.errors,
    };
  }

  if (error instanceof Error) {
    return { status: 500, message: error.message };
  }

  return { status: 500, message: "An unexpected error occurred" };
}

function isAxiosErrorWithBody(
  error: unknown,
): error is AxiosError<ApiErrorBody> {
  return (
    typeof error === "object" &&
    error !== null &&
    "isAxiosError" in error &&
    (error as AxiosError).isAxiosError === true
  );
}
