import "server-only";

import { cache } from "react";

import { getExperience } from "@/lib/experiences";

const DJANGO_BASE = (
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1"
).replace(/\/$/, "");

const TOKEN_RE = /^[A-Za-z0-9_-]{8,32}$/;

export const GENERIC_SHARE_TITLE = "A little something for you";
export const GENERIC_SHARE_DESCRIPTION = "Someone made this for you on Kyndl.";

export type SharePageMeta = {
  title: string;
  description: string;
  image: string;
};

const GENERIC_META: SharePageMeta = {
  title: GENERIC_SHARE_TITLE,
  description: GENERIC_SHARE_DESCRIPTION,
  image: "/og-default.png",
};

/**
 * Metadata for `/v/<token>` unfurls (WhatsApp, iMessage). Fetched anonymously
 * so invite-only gifts never leak a title to a crawler. Always safe to render:
 * failures fall back to the generic card.
 */
export const getSharePageMeta = cache(
  async (token: string): Promise<SharePageMeta> => {
    if (!TOKEN_RE.test(token)) return GENERIC_META;
    try {
      const res = await fetch(`${DJANGO_BASE}/public/creations/${token}/`, {
        headers: { Accept: "application/json" },
        cache: "no-store",
      });
      if (!res.ok) return GENERIC_META;
      const data = (await res.json()) as {
        title?: string;
        type?: string;
      };
      const experience = data.type ? getExperience(data.type) : undefined;
      const title = data.title?.trim() || GENERIC_SHARE_TITLE;
      const description = experience?.tagline
        ? `Someone made this for you on Kyndl. ${experience.tagline}`
        : GENERIC_SHARE_DESCRIPTION;
      return {
        title,
        description,
        image: experience?.previewImage || GENERIC_META.image,
      };
    } catch (error) {
      console.error("[share-meta] fetch failed:", error);
      return GENERIC_META;
    }
  },
);
