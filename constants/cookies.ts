export const COOKIE_NAMES = {
  ACCESS_TOKEN: "kyndl_access_token",
  REFRESH_TOKEN: "kyndl_refresh_token",
} as const;

export const COOKIE_MAX_AGE = {
  ACCESS: 60 * 15, // 15 minutes
  REFRESH: 60 * 60 * 24 * 7, // 7 days
} as const;
