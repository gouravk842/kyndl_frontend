import { Suspense } from "react";

import { RelationshipCalendarBuilder } from "@/features/relationship-calendar/components/builder/relationship-calendar-builder";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Make your Relationship Calendar",
  description:
    "Pin memories to the days that matter — photos, notes, and yearly anniversaries on a keepsake calendar you can share.",
  path: "/relationship-calendar/build",
});

export default function RelationshipCalendarBuildPage() {
  return (
    <Suspense fallback={null}>
      <RelationshipCalendarBuilder />
    </Suspense>
  );
}
