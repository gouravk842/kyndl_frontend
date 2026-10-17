/**
 * Red Zone (adults-only) 18+ consent, remembered on-device for a limited time.
 *
 * Lightweight by design: the consent is a soft gate on the *section* entry, not
 * an authorization boundary. Each Red Zone experience also renders its own age
 * gate when viewed (incl. via a shared link, which never passes through the
 * header), so this only spares a repeat prompt for someone browsing the site.
 *
 * Stored value is the consent timestamp (ms since epoch). After
 * {@link RED_ZONE_CONSENT_TTL_MS} the visitor is asked again.
 */

export const RED_ZONE_CONSENT_KEY = "kyndl:red-zone-consent";

/** How long a Red Zone 18+ confirmation is remembered on this device. */
export const RED_ZONE_CONSENT_TTL_MS = 15 * 24 * 60 * 60 * 1000;

/** True if the visitor has a non-expired 18+ confirmation for the Red Zone. */
export function hasRedZoneConsent(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const raw = window.localStorage.getItem(RED_ZONE_CONSENT_KEY);
    if (!raw) return false;

    // Legacy `"yes"` had no timestamp — clear and re-ask so TTL applies.
    if (raw === "yes") {
      window.localStorage.removeItem(RED_ZONE_CONSENT_KEY);
      return false;
    }

    const at = Number(raw);
    if (!Number.isFinite(at)) {
      window.localStorage.removeItem(RED_ZONE_CONSENT_KEY);
      return false;
    }

    if (Date.now() - at > RED_ZONE_CONSENT_TTL_MS) {
      window.localStorage.removeItem(RED_ZONE_CONSENT_KEY);
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

/** Remember the visitor's 18+ confirmation for {@link RED_ZONE_CONSENT_TTL_MS}. */
export function setRedZoneConsent(): void {
  try {
    window.localStorage.setItem(RED_ZONE_CONSENT_KEY, String(Date.now()));
  } catch {
    // Private mode / storage disabled — they'll just be asked again.
  }
}
