import type { NextRequest } from "next/server";

import { decodeKeepToken } from "@/features/memory-bank/lib/keep-token";
import { djangoFetch, forward } from "@/lib/server/django";

export const dynamic = "force-dynamic";

type Context = { params: Promise<{ token: string }> };

function djangoPath(token: string): string {
  return `/memory-bank/keep/stop/${encodeURIComponent(decodeKeepToken(token))}/`;
}

// The signed token is the credential. A GET must not turn mail off; mail
// scanners request every link. Stopping is the POST, including one-click
// unsubscribe from a mail client.
export async function GET(_req: NextRequest, ctx: Context) {
  const { token } = await ctx.params;
  const result = await djangoFetch(djangoPath(token), { method: "GET" });
  return forward(result);
}

export async function POST(_req: NextRequest, ctx: Context) {
  const { token } = await ctx.params;
  const result = await djangoFetch(djangoPath(token), {
    method: "POST",
    body: {},
  });
  return forward(result);
}
