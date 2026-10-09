import { env } from "@/config/env";

/**
 * Central error-reporting seam. Logs to the server/browser console today so
 * platform log drains (and local terminals) capture failures. Wire a vendor
 * here later without touching call sites.
 */
export function reportError(
  error: Error & { digest?: string },
  context?: Record<string, unknown>,
): void {
  if (env.isDev) {
    console.error("[reportError]", error, context);
    return;
  }

  // In production, avoid leaking full stacks to the browser console; log a
  // stable digest the backend/monitoring can correlate.
  console.error("[reportError]", {
    message: error.message,
    digest: error.digest,
    ...context,
  });
}
