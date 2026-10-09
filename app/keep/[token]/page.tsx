import {
  KeepFaded,
  type KeepPreview,
  KeepUnavailable,
  PublicKeepForm,
} from "@/features/memory-bank/components/public-keep";
import { decodeKeepToken } from "@/features/memory-bank/lib/keep-token";
import { createMetadata } from "@/lib/seo";
import { djangoFetch } from "@/lib/server/django";

export const dynamic = "force-dynamic";

export const metadata = createMetadata({
  title: "Keep a memory",
  description: "Add today's memory from your reminder.",
  path: "/keep",
  noIndex: true,
});

type Props = { params: Promise<{ token: string }> };

function isPreview(body: unknown): body is KeepPreview {
  if (!body || typeof body !== "object") return false;
  const value = body as Record<string, unknown>;
  return (
    typeof value.first_name === "string" &&
    typeof value.current_streak === "number" &&
    typeof value.kept_today === "boolean"
  );
}

export default async function KeepPage({ params }: Props) {
  const { token: raw } = await params;
  const token = decodeKeepToken(raw);
  const preview = await loadPreview(token);
  if (preview === "down") return <KeepUnavailable />;
  if (!preview) return <KeepFaded />;
  return <PublicKeepForm token={token} preview={preview} />;
}

async function loadPreview(
  token: string,
): Promise<KeepPreview | "down" | null> {
  try {
    const result = await djangoFetch(
      `/memory-bank/keep/${encodeURIComponent(token)}/`,
      { method: "GET" },
    );
    if (result.status === 200 && isPreview(result.body)) return result.body;
    if (result.status >= 500) return "down";
    return null;
  } catch {
    return "down";
  }
}
