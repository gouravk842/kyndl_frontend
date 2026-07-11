import { RedZoneSection } from "@/features/red-zone/components/red-zone-section";
import { createMetadata } from "@/lib/seo";
import { getRedZoneExperiencesView } from "@/lib/server/experiences";

export const metadata = createMetadata({
  title: "Red Zone · 18+",
  description:
    "Adults-only experiences for couples — playful, intimate, and entirely customizable, shared by a private link only the two of you hold.",
  path: "/red-zone",
});

// Visibility/status/pricing are backend-controlled, fetched fresh per request.
export const dynamic = "force-dynamic";

export default async function RedZonePage() {
  const experiences = await getRedZoneExperiencesView();
  return <RedZoneSection experiences={experiences} />;
}
