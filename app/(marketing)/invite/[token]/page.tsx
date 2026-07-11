import { AcceptInvite } from "@/features/collaboration/components/accept-invite";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Accept invitation",
  description: "Join a Kyndl memory page you've been invited to.",
  path: "/invite",
  noIndex: true,
});

// In this Next version, route params are async.
type Props = { params: Promise<{ token: string }> };

export default async function AcceptInvitePage({ params }: Props) {
  const { token } = await params;
  return <AcceptInvite token={token} />;
}
