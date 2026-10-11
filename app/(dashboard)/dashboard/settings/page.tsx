import { ROUTES } from "@/constants/routes";
import { SettingsView } from "@/features/settings/components/settings-view";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Settings",
  description: "Manage your Kyndl account and notification preferences.",
  path: ROUTES.settings,
  noIndex: true,
});

export default function SettingsPage() {
  return <SettingsView />;
}
