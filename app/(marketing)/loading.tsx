import { PageContainer } from "@/components/layout/page-container";
import { Skeleton } from "@/components/ui/skeleton";

export default function MarketingLoading() {
  return (
    <PageContainer size="xl" className="py-12 md:py-16">
      <Skeleton className="h-10 w-56 bg-[#F2DACE] sm:w-72" />
      <Skeleton className="mt-4 h-4 w-full max-w-lg bg-[#F2DACE]/80" />
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-48 rounded-2xl bg-[#F2DACE]" />
        ))}
      </div>
    </PageContainer>
  );
}
