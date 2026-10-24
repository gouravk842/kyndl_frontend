import type { CreationVisibility } from "@/types/creation";

/**
 * Helpers for the first-share path: copy a link a guest can actually open,
 * send it on WhatsApp, and never paste a relative `/v/…` path.
 */

export function canonicalShareUrl(creation: {
  share_url?: string | null;
  public_token: string;
}): string {
  const fromServer = creation.share_url?.trim() ?? "";
  if (/^https?:\/\//i.test(fromServer)) return fromServer;
  const origin = appOrigin();
  return `${origin}/v/${creation.public_token}`;
}

function appOrigin(): string {
  if (typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin;
  }
  return (
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
    "http://localhost:4000"
  );
}

/** True when a signed-out partner can open the published link. */
export function guestCanOpen(
  visibility: CreationVisibility,
  invites: string[] = [],
): boolean {
  if (visibility === "public") return true;
  return invites.some((email) => email.trim().length > 0);
}

export function shareText(title: string | undefined, url: string): string {
  const name = title?.trim();
  return name
    ? `I made this for you: ${name}\n${url}`
    : `I made this for you on Kyndl.\n${url}`;
}

export function whatsappShareHref(url: string, title?: string): string {
  return `https://wa.me/?text=${encodeURIComponent(shareText(title, url))}`;
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
