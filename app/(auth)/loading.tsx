import { Skeleton } from "@/components/ui/skeleton";

export default function AuthLoading() {
  return (
    <div className="flex h-full w-full flex-col justify-center gap-4 p-6">
      <Skeleton className="h-8 w-40 bg-[#F2DACE]" />
      <Skeleton className="h-4 w-56 bg-[#F2DACE]/80" />
      <Skeleton className="mt-4 h-11 w-full rounded-full bg-[#F2DACE]" />
      <Skeleton className="h-11 w-full rounded-full bg-[#F2DACE]" />
      <Skeleton className="h-11 w-full rounded-full bg-[#F2DACE]" />
    </div>
  );
}
