/**
 * Auth cookie names. The tokens are set as `httpOnly; Secure; SameSite=Lax`
 * cookies by the Next BFF (`app/api/auth/*`) on login/verify/refresh and cleared
 * on logout — the frontend never reads or writes their values, it only
 * references these names in proxy.ts for presence checks.
 *
 * `SIGNED_IN` is a non-httpOnly presence flag (value always `"1"`) so client JS
 * can skip the `/api/auth/me` probe for anonymous visitors. It never holds a
 * token — only whether a session cookie is believed to exist.
 *
 * Referral attribution uses a readable (non-httpOnly) cookie so the BFF can
 * stamp `referral_code` onto payment creates. Last-click wins; TTL matches
 * backend `REFERRAL_COOKIE_TTL_DAYS` (30).
 */
export const COOKIE_NAMES = {
  ACCESS_TOKEN: "kyndl_access_token",
  REFRESH_TOKEN: "kyndl_refresh_token",
  /** Readable session presence flag — not a credential. */
  SIGNED_IN: "kyndl_signed_in",
  REFERRAL_CODE: "kyndl_ref",
} as const;

/** Days the referral attribution cookie should live (last-click). */
export const REFERRAL_COOKIE_TTL_DAYS = 30;
