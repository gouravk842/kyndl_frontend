import { ConstellationExperience } from "@/features/constellation/components/constellation-experience";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Constellation",
  description:
    "A private night sky. Every bright star is a moment you shared; the lines between them trace a shape only you two would recognise. Touch a star to open the memory.",
  path: "/constellation",
});

export default function ConstellationPage() {
  return <ConstellationExperience />;
}
