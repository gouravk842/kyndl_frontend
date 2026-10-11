import { COOKIE_NAMES } from "@/constants/cookies";

/**
 * Whether the readable session-presence cookie is set. Used only to decide
 * whether to call `/api/auth/me` — never as authorization.
 */
export function hasSignedInMarker(): boolean {
  if (typeof document === "undefined") return false;
  const needle = `${COOKIE_NAMES.SIGNED_IN}=`;
  return document.cookie.split("; ").some((part) => part.startsWith(needle));
}
