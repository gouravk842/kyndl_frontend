import { djangoFetch, forward } from "@/lib/server/django";

// Public product taxonomy (master categories + subcategories) — no auth.
export const dynamic = "force-dynamic";

export async function GET() {
  const result = await djangoFetch(`/gifts/categories/`, { method: "GET" });
  return forward(result);
}
