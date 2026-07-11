/**
 * Red Zone (adults-only) 18+ consent, remembered on-device.
 *
 * Lightweight by design: the consent is a soft gate on the *section* entry, not
 * an authorization boundary. Each Red Zone experience also renders its own age
 * gate when viewed (incl. via a shared link, which never passes through the
 * header), so this only spares a repeat prompt for someone browsing the site.
 */

export const RED_ZONE_CONSENT_KEY = "kyndl:red-zone-consent";

/** True once the visitor has confirmed they're 18+ for the Red Zone section. */
export function hasRedZoneConsent(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(RED_ZONE_CONSENT_KEY) === "yes";
  } catch {
    return false;
  }
}

/** Remember the visitor's 18+ confirmation for next time. */
export function setRedZoneConsent(): void {
  try {
    window.localStorage.setItem(RED_ZONE_CONSENT_KEY, "yes");
  } catch {
    // Private mode / storage disabled — they'll just be asked again.
  }
}
