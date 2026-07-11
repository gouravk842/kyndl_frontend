import { PublicCreationViewer } from "@/features/public-viewer/public-creation-viewer";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "A little something for you",
  description: "Someone made this for you on Kyndl.",
  path: "/v",
});

// In this Next version, dynamic route params are async.
type PageProps = { params: Promise<{ token: string }> };

export default async function PublicCreationPage({ params }: PageProps) {
  const { token } = await params;
  return <PublicCreationViewer token={token} />;
}
