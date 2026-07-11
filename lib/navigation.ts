import { ROUTES } from "@/constants/routes";

/**
 * Validate a `callbackUrl` query param before redirecting to it.
 *
 * Only same-origin relative paths are allowed. Anything else — absolute URLs
 * (`https://evil.com`), protocol-relative (`//evil.com`), or backslash tricks
 * (`/\evil.com`, which some browsers normalise to `//`) — is rejected to prevent
 * open-redirect attacks where an attacker crafts `/login?callbackUrl=...` to
 * bounce a freshly-authenticated user to a phishing clone.
 */
export function safeInternalPath(
  url: string | null | undefined,
): string | null {
  if (!url) return null;
  if (!url.startsWith("/")) return null; // must be rooted at "/"
  if (url.startsWith("//") || url.startsWith("/\\")) return null; // not protocol-relative
  return url;
}

/**
 * Append a validated `callbackUrl` to a target auth route so the user's intended
 * destination survives the login ↔ register ↔ verify navigation. Returns `path`
 * unchanged when the callback is missing or unsafe.
 */
export function withCallbackUrl(
  path: string,
  callbackUrl: string | null | undefined,
): string {
  const safe = safeInternalPath(callbackUrl);
  if (!safe) return path;
  const sep = path.includes("?") ? "&" : "?";
  return `${path}${sep}callbackUrl=${encodeURIComponent(safe)}`;
}

/** Resolve where to send a user after a successful login/verify. */
export function postAuthDestination(
  callbackUrl: string | null | undefined,
): string {
  return safeInternalPath(callbackUrl) ?? ROUTES.dashboard;
}
