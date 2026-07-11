"use client";

import { useQuery } from "@tanstack/react-query";
import { Loader2, Share2, Ticket } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { SignInLink } from "@/components/auth/sign-in-link";
import { Flames } from "@/features/desire-deck/components/flames";
import { formatRelativeTime } from "@/lib/creations";
import { creationService } from "@/services/creations/creation.service";
import { useAuthStore } from "@/store/auth.store";

import { type CouponBook, HEAT_META } from "../../config";

/**
 * The owner's redemptions view: who has cashed in which coupons, newest first.
 * Loads the booklet (for coupon titles) and the responses, joining them by
 * couponId.
 */
export function OwnerRedemptions() {
  const params = useSearchParams();
  const id = params.get("id");
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const enabled = isHydrated && isAuthenticated && !!id;

  const bookQuery = useQuery({
    queryKey: ["coupons-creation", id],
    queryFn: () => creationService.get<CouponBook>(id as string),
    enabled,
  });
  const responsesQuery = useQuery({
    queryKey: ["coupons-responses", id],
    queryFn: () => creationService.responses(id as string),
    enabled,
  });

  if (isHydrated && !isAuthenticated) {
    return (
      <Centered>
        <h1 className="font-display text-2xl text-white">Sign in to see this</h1>
        <SignInLink className="rounded-full bg-gradient-to-r from-[#ff4d6d] to-[#c81d4e] px-6 py-2.5 text-sm font-semibold text-white">
          Sign in
        </SignInLink>
      </Centered>
    );
  }

  if (!id) {
    return (
      <Centered>
        <p className="text-white/55">No booklet selected.</p>
      </Centered>
    );
  }

  if (!isHydrated || bookQuery.isLoading || responsesQuery.isLoading) {
    return (
      <Centered>
        <Loader2 className="size-6 animate-spin text-white/50" />
      </Centered>
    );
  }

  const book = bookQuery.data;
  if (!book) {
    return (
      <Centered>
        <p className="text-white/55">Couldn&apos;t load this booklet.</p>
      </Centered>
    );
  }

  const byId = new Map(book.content.coupons.map((c) => [c.id, c]));
  // Only coupon redemptions (rows carrying a couponId).
  const redemptions = (responsesQuery.data ?? []).filter(
    (r) => r.payload?.couponId,
  );

  return (
    <div className="w-full max-w-md">
      <header className="mb-6 text-center">
        <span className="mx-auto mb-3 grid size-14 place-items-center rounded-full bg-gradient-to-br from-[#ff4d6d] to-[#c81d4e] text-white shadow-lg">
          <Ticket className="size-6" />
        </span>
        <h1 className="font-display text-2xl text-white">Redemptions</h1>
        <p className="mt-1 text-sm text-white/55">
          {book.content.title || "Your coupon book"}
        </p>
      </header>

      {redemptions.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-10 text-center">
          <p className="text-white/55">
            Nothing redeemed yet. When {book.content.recipientName || "they"}{" "}
            cash one in, it shows up here — and you{"'"}ll get an email.
          </p>
          <Link
            href={`/v/${book.public_token}`}
            className="inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-2.5 text-sm font-medium text-white/80 transition-colors hover:bg-white/10"
          >
            <Share2 className="size-4" /> Open the share link
          </Link>
        </div>
      ) : (
        <ul className="space-y-2.5">
          {redemptions.map((r) => {
            const coupon = r.payload.couponId
              ? byId.get(r.payload.couponId)
              : undefined;
            const heat = coupon?.heat ?? "sweet";
            return (
              <li
                key={r.id}
                className="rounded-xl border border-[#ff4d6d]/30 bg-[#ff4d6d]/10 px-4 py-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-2 font-medium text-white">
                    <span
                      className="size-2.5 shrink-0 rounded-full"
                      style={{ background: HEAT_META[heat].accent }}
                      aria-hidden
                    />
                    {coupon?.title ?? "A coupon"}
                  </span>
                  <Flames heat={heat} />
                </div>
                {r.payload.message && (
                  <p className="mt-1.5 text-sm text-white/70">
                    “{r.payload.message}”
                  </p>
                )}
                <p className="mt-1 text-xs text-white/40">
                  {r.responder_name ? `${r.responder_name} · ` : ""}
                  {formatRelativeTime(r.created_at)}
                </p>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 px-6 text-center">
      {children}
    </div>
  );
}
