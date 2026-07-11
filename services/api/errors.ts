import type { AxiosError } from "axios";

import type { ApiError, ApiErrorBody } from "@/types/api";

const FALLBACK = "Something went wrong. Please try again.";

export function normalizeApiError(error: unknown): ApiError {
  if (isAxiosErrorWithBody(error)) {
    const status = error.response?.status ?? 500;
    const body = error.response?.data;
    return {
      status,
      message: extractMessage(body) ?? error.message ?? FALLBACK,
      code: body?.code,
      retryAfterSeconds: body?.retry_after_seconds,
      details: body,
    };
  }

  if (error instanceof Error) {
    return { status: 500, message: error.message };
  }

  return { status: 500, message: FALLBACK };
}

/**
 * DRF returns either `{ detail }` (domain errors) or `{ <field>: ["msg"] }`
 * (serializer validation). Pull out the first human-readable string.
 */
function extractMessage(body: ApiErrorBody | undefined): string | undefined {
  if (!body) return undefined;

  if (typeof body.detail === "string") return body.detail;
  if (Array.isArray(body.detail) && body.detail.length) return body.detail[0];

  for (const [key, value] of Object.entries(body)) {
    if (key === "code" || key === "retry_after_seconds") continue;
    if (typeof value === "string") return value;
    if (Array.isArray(value) && typeof value[0] === "string") return value[0];
  }

  return undefined;
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
