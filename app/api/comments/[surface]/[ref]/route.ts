import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import {
  djangoFetch,
  forward,
  getAccessToken,
  readJson,
} from "@/lib/server/django";

// Reads the auth cookie per request — never cache.
export const dynamic = "force-dynamic";

// Dynamic route params are async in this Next version.
type Context = { params: Promise<{ surface: string; ref: string }> };

function unauthorized() {
  return NextResponse.json(
    { detail: "Not authenticated.", code: "not_authenticated" },
    { status: 401 },
  );
}

// The Django app is `conversations`; the browser-facing surface is `comments`.
function target(surface: string, ref: string, suffix = "") {
  return `/conversations/${surface}/${encodeURIComponent(ref)}${suffix}`;
}

// The thread bundle + a page of messages + the viewer's context. Signed-in only.
export async function GET(req: NextRequest, ctx: Context) {
  const accessToken = getAccessToken(req);
  if (!accessToken) return unauthorized();

  const { surface, ref } = await ctx.params;
  const qs = req.nextUrl.search; // preserves ?limit / ?offset / ?scope
  const result = await djangoFetch(`${target(surface, ref, "/")}${qs}`, {
    method: "GET",
    accessToken,
  });
  return forward(result);
}

// Post a message to the thread.
export async function POST(req: NextRequest, ctx: Context) {
  const accessToken = getAccessToken(req);
  if (!accessToken) return unauthorized();

  const { surface, ref } = await ctx.params;
  const qs = req.nextUrl.search; // ?scope for a chat moderator
  const body = await readJson(req);
  const result = await djangoFetch(`${target(surface, ref, "/")}${qs}`, {
    method: "POST",
    body,
    accessToken,
  });
  return forward(result);
}
