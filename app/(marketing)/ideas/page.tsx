import { ROUTES } from "@/constants/routes";
import { SubmitIdea } from "@/features/ideas/components/submit-idea";
import { isIdeaSource } from "@/features/ideas/idea-href";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Submit an idea",
  description:
    "Tell us the keepsake, game, or gift you were hoping to find. If it isn't on the shelf, leave the idea here — we'll try to figure it out.",
  path: ROUTES.ideas,
});

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function IdeasPage({
  searchParams,
}: {
  searchParams: Promise<{
    source?: string | string[];
    seed?: string | string[];
  }>;
}) {
  const params = await searchParams;
  const rawSource = first(params.source);
  const source = rawSource && isIdeaSource(rawSource) ? rawSource : "homepage";
  const seed = (first(params.seed) ?? "").slice(0, 200);

  return (
    <div className="pt-6 md:pt-10">
      <SubmitIdea
        source={source}
        variant="band"
        seed={seed}
        contextLine={
          seed ? `Nothing on the shelf matches “${seed}”.` : undefined
        }
      />
    </div>
  );
}
