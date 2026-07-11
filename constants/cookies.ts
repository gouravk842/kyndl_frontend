/**
 * Auth cookie names. The tokens are set as `httpOnly; Secure; SameSite=Lax`
 * cookies by the Next BFF (`app/api/auth/*`) on login/verify/refresh and cleared
 * on logout — the frontend never reads or writes their values, it only
 * references these names in proxy.ts for presence checks.
 */
export const COOKIE_NAMES = {
  ACCESS_TOKEN: "kyndl_access_token",
  REFRESH_TOKEN: "kyndl_refresh_token",
} as const;
