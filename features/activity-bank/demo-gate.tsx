"use client";

import { useQuery } from "@tanstack/react-query";
import type { ReactNode } from "react";

import { fetchActivityBank } from "./api";
import type { BankItem } from "./types";

export function useDemoCatalog(includeAdult: boolean, enabled = true) {
  return useQuery({
    queryKey: ["activity-bank", "demo", includeAdult],
    enabled,
    staleTime: 5 * 60 * 1000,
    retry: 1,
    queryFn: () => fetchActivityBank({ includeAdult }),
  });
}

/**
 * Public demos omit authored content. Load the bank, then play that catalog
 * in the sample's layout. A saved creation or a builder draft passes
 * `authored` and skips the fetch.
 */
export function DemoGate<T>({
  authored,
  fallback,
  includeAdult,
  apply,
  children,
}: {
  authored: T | undefined;
  fallback: T;
  includeAdult: boolean;
  apply: (items: BankItem[], base: T) => T;
  children: (value: T) => ReactNode;
}) {
  const demo = authored === undefined;
  const query = useDemoCatalog(includeAdult, demo);

  if (demo && query.isLoading) {
    return (
      <div className="grid min-h-[40vh] w-full place-items-center">
        <p className="animate-pulse font-display text-lg text-[#c75b39]">
          opening the bank…
        </p>
      </div>
    );
  }

  const value =
    authored ?? (query.data ? apply(query.data.items, fallback) : fallback);
  return children(value);
}
