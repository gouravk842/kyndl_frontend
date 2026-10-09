import { redirect } from "next/navigation";

import { ROUTES } from "@/constants/routes";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Your banks",
  description: "Switch whose memories you are looking at.",
  path: ROUTES.memoryHomes,
  noIndex: true,
});

export default function MemoryHomesPage() {
  redirect(ROUTES.memories);
}
