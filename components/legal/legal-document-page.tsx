import { notFound } from "next/navigation";

import { PageContainer } from "@/components/layout/page-container";
import { MarkdownBody } from "@/components/legal/markdown-body";
import { PageHeader } from "@/components/shared/page-header";
import { getLegalPage, type LegalPageSlug } from "@/lib/server/legal";

function formatUpdatedAt(iso: string): string | null {
  try {
    return new Intl.DateTimeFormat("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date(iso));
  } catch {
    return null;
  }
}

export async function LegalDocumentPage({ slug }: { slug: LegalPageSlug }) {
  const page = await getLegalPage(slug);
  if (!page) notFound();

  const updated = formatUpdatedAt(page.updated_at);

  return (
    <div className="relative overflow-hidden pb-16 md:pb-24">
      <PageHeader
        compact
        eyebrow="Legal"
        title={page.title}
        subtitle={updated ? `Last updated ${updated}` : undefined}
      />
      <PageContainer size="md" className="relative mt-2 md:mt-4">
        <article className="mx-auto max-w-2xl">
          <MarkdownBody source={page.body} />
        </article>
      </PageContainer>
    </div>
  );
}
