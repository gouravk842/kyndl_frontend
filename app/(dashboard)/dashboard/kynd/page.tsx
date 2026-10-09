import { ROUTES } from "@/constants/routes";
import { KyndHome } from "@/features/kynd/components/kynd-home";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Kynd",
  description: "Little things worth remembering.",
  path: ROUTES.kynd,
  noIndex: true,
});

export default function KyndPage() {
  return <KyndHome />;
}
