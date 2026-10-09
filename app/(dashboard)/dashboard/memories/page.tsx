import { ROUTES } from "@/constants/routes";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Memories",
  description: "Your banks, floating in one space.",
  path: ROUTES.memories,
  noIndex: true,
});

export default function MemoriesPage() {
  return null;
}
