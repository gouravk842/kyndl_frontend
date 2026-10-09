import {
  PublicReminderStop,
  StopFaded,
  type StopPreview,
  StopUnavailable,
} from "@/features/memory-bank/components/public-reminder-stop";
import { decodeKeepToken } from "@/features/memory-bank/lib/keep-token";
import { createMetadata } from "@/lib/seo";
import { djangoFetch } from "@/lib/server/django";

export const dynamic = "force-dynamic";

export const metadata = createMetadata({
  title: "Stop memory reminders",
  description: "Stop the daily email that asks you to keep a memory.",
  path: "/keep/stop",
  noIndex: true,
});

type Props = { params: Promise<{ token: string }> };

function isPreview(body: unknown): body is StopPreview {
  if (!body || typeof body !== "object") return false;
  const value = body as Record<string, unknown>;
  return (
    typeof value.first_name === "string" && typeof value.stopped === "boolean"
  );
}

export default async function StopReminderPage({ params }: Props) {
  const { token: raw } = await params;
  const token = decodeKeepToken(raw);
  const preview = await loadPreview(token);
  if (preview === "down") return <StopUnavailable />;
  if (!preview) return <StopFaded />;
  return <PublicReminderStop token={token} preview={preview} />;
}

async function loadPreview(
  token: string,
): Promise<StopPreview | "down" | null> {
  try {
    const result = await djangoFetch(
      `/memory-bank/keep/stop/${encodeURIComponent(token)}/`,
      { method: "GET" },
    );
    if (result.status === 200 && isPreview(result.body)) return result.body;
    if (result.status >= 500) return "down";
    return null;
  } catch {
    return "down";
  }
}
