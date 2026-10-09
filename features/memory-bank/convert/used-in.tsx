"use client";

import Link from "next/link";

import type { BankConversionLink } from "@/types/memory-bank";

export function UsedIn({
  conversions,
}: {
  conversions?: BankConversionLink[];
}) {
  if (!conversions?.length) return null;
  return (
    <span className="block truncate text-xs text-[var(--mb-solar-muted)]">
      Used in:{" "}
      {conversions.map((item, index) => (
        <span key={item.id}>
          {index > 0 ? ", " : null}
          <Link
            href={`/dashboard?id=${item.creation_id}`}
            className="underline decoration-[#C75B39]/40 underline-offset-2 hover:text-[var(--mb-solar-ink)]"
            onClick={(event) => event.stopPropagation()}
          >
            {item.label}
          </Link>
        </span>
      ))}
    </span>
  );
}
