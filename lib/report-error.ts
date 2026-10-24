import { env } from "@/config/env";

const INGEST_PATH = "/api/issues/client-errors";
const MESSAGE_MAX = 500;

let lastRequestId = "";

/** Remember the most recent ``X-Request-ID`` so crash UI can show it. */
export function rememberRequestId(id: string): void {
  const trimmed = id.trim();
  if (trimmed) lastRequestId = trimmed;
}

export function getLastRequestId(): string {
  return lastRequestId;
}

function stripQuery(path: string): string {
  return path.split("?")[0]?.split("#")[0] ?? "";
}

function ingestClientError(
  error: Error & { digest?: string },
  context?: Record<string, unknown>,
): void {
  if (typeof window === "undefined") return;

  const contextPath =
    typeof context?.path === "string" ? context.path : window.location.pathname;
  const path = stripQuery(contextPath);
  if (path.includes("/issues/client-errors")) return;

  const payload: Record<string, unknown> = {
    message: (error.message || "Unknown error").slice(0, MESSAGE_MAX),
    name: error.name || "Error",
  };
  if (error.digest) payload.digest = String(error.digest).slice(0, 64);
  if (typeof context?.boundary === "string" && context.boundary) {
    payload.boundary = context.boundary.slice(0, 32);
  }
  if (path) payload.path = path.slice(0, 255);
  const requestId =
    (typeof context?.request_id === "string" && context.request_id) ||
    lastRequestId;
  if (requestId) payload.request_id = requestId.slice(0, 64);
  if (typeof context?.status === "number") payload.status = context.status;

  const body = JSON.stringify(payload);
  try {
    if (
      typeof navigator !== "undefined" &&
      typeof navigator.sendBeacon === "function"
    ) {
      const blob = new Blob([body], { type: "application/json" });
      if (navigator.sendBeacon(INGEST_PATH, blob)) return;
    }
    void fetch(INGEST_PATH, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
      credentials: "same-origin",
    }).catch(() => {
      /* ingest is best-effort */
    });
  } catch {
    /* never throw from reportError */
  }
}

/**
 * Central error-reporting seam. Logs to the console and posts a scrubbed
 * payload to the first-party issues inbox. Wire a vendor here later without
 * touching call sites.
 */
export function reportError(
  error: Error & { digest?: string },
  context?: Record<string, unknown>,
): void {
  ingestClientError(error, context);

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
