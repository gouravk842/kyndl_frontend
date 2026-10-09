"use client";

import { usePathname } from "next/navigation";

import { MemorySpace } from "@/features/memory-bank/components/memory-space";

export default function MemoriesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  if (pathname.includes("/trash") || pathname.includes("/homes")) {
    return children;
  }
  const match = pathname.match(/\/memories\/([^/]+)$/);
  const slug = match?.[1];
  const circleId = slug ? slug : undefined;
  return <MemorySpace circleId={circleId} />;
}
