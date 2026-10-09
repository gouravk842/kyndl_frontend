import { ROUTES } from "@/constants/routes";
import { MemoryTrashView } from "@/features/memory-bank/components/memory-trash";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Trash",
  description: "Circles and memories you deleted, before they go for good.",
  path: ROUTES.memoryTrash,
  noIndex: true,
});

export default function MemoryTrashPage() {
  return <MemoryTrashView />;
}
