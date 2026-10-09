import type { NextRequest } from "next/server";

import { decodeKeepToken } from "@/features/memory-bank/lib/keep-token";
import { djangoFetch, forward, readJson } from "@/lib/server/django";

export const dynamic = "force-dynamic";

type Context = { params: Promise<{ token: string }> };

function djangoPath(token: string): string {
  return `/memory-bank/keep/${encodeURIComponent(decodeKeepToken(token))}/`;
}

// The signed token is the credential. Do not forward a session cookie: a
// logged-in browser must not change whose bank the link writes.
export async function GET(_req: NextRequest, ctx: Context) {
  const { token } = await ctx.params;
  const result = await djangoFetch(djangoPath(token), { method: "GET" });
  return forward(result);
}

export async function POST(req: NextRequest, ctx: Context) {
  const { token } = await ctx.params;
  const body = await readJson(req);
  const result = await djangoFetch(djangoPath(token), {
    method: "POST",
    body: {
      title: body.title,
      note: body.note,
    },
  });
  return forward(result);
}
