import { type NextRequest, NextResponse } from "next/server";

import { COOKIE_NAMES, REFERRAL_COOKIE_TTL_DAYS } from "@/constants/cookies";
import { ROUTES } from "@/constants/routes";
import { getExperience } from "@/lib/experiences";
import { djangoFetch } from "@/lib/server/django";

export const dynamic = "force-dynamic";

type TargetKind = "experience" | "gift" | "general";

function resolveRedirect(kind: TargetKind, slug: string): string {
  if (kind === "gift" && slug) {
    return `${ROUTES.gifts}/${slug}`;
  }
  if (kind === "experience" && slug) {
    const exp = getExperience(slug);
    return exp?.liveHref || ROUTES.experiences;
  }
  return ROUTES.experiences;
}

function parseTarget(segments: string[] | undefined): {
  kind: TargetKind;
  slug: string;
  path: string;
} {
  if (!segments || segments.length === 0) {
    return { kind: "general", slug: "", path: "" };
  }
  const [rawKind, ...rest] = segments;
  const slug = (rest[0] || "").toLowerCase();
  if (rawKind === "exp" || rawKind === "experience") {
    return { kind: "experience", slug, path: segments.join("/") };
  }
  if (rawKind === "gift") {
    return { kind: "gift", slug, path: segments.join("/") };
  }
  return { kind: "general", slug: "", path: segments.join("/") };
}

/**
 * Public referral short-link: record click, set last-click cookie, redirect.
 * Shapes: /r/{code} | /r/{code}/exp/{slug} | /r/{code}/gift/{slug}
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ code: string; target?: string[] }> },
) {
  const { code: rawCode, target } = await context.params;
  const code = (rawCode || "").trim().toLowerCase();
  const { kind, slug, path } = parseTarget(target);
  const destination = new URL(resolveRedirect(kind, slug), request.url);

  if (code) {
    try {
      await djangoFetch("/referrals/clicks/", {
        method: "POST",
        body: {
          code,
          target_kind: kind,
          target_slug: slug,
          path: `/r/${code}${path ? `/${path}` : ""}`,
        },
      });
    } catch {
      // Never block the redirect on click-ingest failure.
    }
  }

  const response = NextResponse.redirect(destination);
  if (code) {
    response.cookies.set(COOKIE_NAMES.REFERRAL_CODE, code, {
      path: "/",
      maxAge: REFERRAL_COOKIE_TTL_DAYS * 24 * 60 * 60,
      sameSite: "lax",
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
    });
  }
  return response;
}
