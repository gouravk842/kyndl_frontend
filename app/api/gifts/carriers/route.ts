import { djangoFetch, forward } from "@/lib/server/django";

// Public list of shipping carriers for the fulfillment dropdown — no auth.
export const dynamic = "force-dynamic";

export async function GET() {
  const result = await djangoFetch(`/gifts/carriers/`, { method: "GET" });
  return forward(result);
}
