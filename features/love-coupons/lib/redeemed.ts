/**
 * Which coupons this device has already redeemed, remembered locally so the
 * "REDEEMED" stamp persists on reload. The owner's notification list is the real
 * record; this is just the partner-side visual (so it's keyed per share token).
 */

const KEY = (token: string) => `kyndl:coupons-redeemed:${token}`;

export function getRedeemed(token: string): Set<string> {
  if (typeof window === "undefined" || !token) return new Set();
  try {
    const raw = window.localStorage.getItem(KEY(token));
    return new Set(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    return new Set();
  }
}

export function markRedeemed(token: string, couponId: string): void {
  if (!token) return;
  try {
    const next = getRedeemed(token);
    next.add(couponId);
    window.localStorage.setItem(KEY(token), JSON.stringify([...next]));
  } catch {
    // storage disabled — the stamp just won't survive a reload
  }
}
