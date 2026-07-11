import { env } from "@/config/env";

/**
 * Central error-reporting seam. Today it logs to the console; this is the single
 * place to wire an observability vendor (e.g. Sentry's `captureException`) later
 * without touching the error boundaries that call it.
 */
export function reportError(
  error: Error & { digest?: string },
  context?: Record<string, unknown>,
): void {
  // TODO(observability): forward to Sentry/Datadog here.
  if (env.isDev) {
    console.error("[reportError]", error, context);
    return;
  }

  // In production, avoid leaking full stacks to the console; log a stable digest
  // the backend/monitoring can correlate.
  console.error("[reportError]", {
    message: error.message,
    digest: error.digest,
    ...context,
  });
}
