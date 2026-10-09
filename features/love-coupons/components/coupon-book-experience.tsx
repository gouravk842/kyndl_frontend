"use client";

import { AnimatePresence, motion, type Variants } from "framer-motion";
import { Check, ChevronLeft, ChevronRight, Flame, Lock } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { CatalogImage } from "@/features/activity-bank/components/catalog-image";
import { applyCoupons } from "@/features/activity-bank/demo-content";
import { DemoGate } from "@/features/activity-bank/demo-gate";
import { Flames } from "@/features/desire-deck/components/flames";
import { creationService } from "@/services/creations/creation.service";

import {
  type Coupon,
  COUPON_BOOK,
  type CouponBook,
  HEAT_META,
} from "../config";
import { getRedeemed, markRedeemed } from "../lib/redeemed";
import { ScratchToRedeem } from "./scratch-to-redeem";

/**
 * The partner-facing coupon book. One coupon per page — each starts hidden under
 * scratch foil, so the coupon is a surprise until you scratch it off (which also
 * redeems it and pings the owner). Flip through with the page arrows.
 *
 * Reads content from props (defaults to the bundled sample for the marketing
 * demo). With a share `token`, scratching pings the owner; without one (demo /
 * builder preview) it just reveals locally.
 *
 * Acts: 18+ gate → flip the book → scratch a page to reveal & claim its coupon.
 */
export function CouponBookExperience(props: {
  content?: CouponBook;
  token?: string;
  skipGate?: boolean;
  assets?: Record<string, string>;
}) {
  return (
    <DemoGate
      authored={props.content}
      fallback={COUPON_BOOK}
      includeAdult
      apply={applyCoupons}
    >
      {(content) => <CouponBookPlay {...props} content={content} />}
    </DemoGate>
  );
}

function CouponBookPlay({
  content,
  token,
  skipGate = false,
  assets,
}: {
  content: CouponBook;
  token?: string;
  skipGate?: boolean;
  assets?: Record<string, string>;
}) {
  const [entered, setEntered] = useState(skipGate);
  const [page, setPage] = useState(0);
  const [dir, setDir] = useState(1);
  const [redeemed, setRedeemed] = useState<Set<string>>(new Set());

  // Hydrate redeemed set from this device once mounted (per share token).
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate from localStorage on mount
    if (token) setRedeemed(getRedeemed(token));
  }, [token]);

  const coupons = content.coupons;
  const total = coupons.length;
  // Clamp so removing coupons in the live builder preview never strands us.
  const index = Math.min(page, Math.max(0, total - 1));
  const coupon = coupons[index];

  const onReveal = useCallback(
    (id: string) => {
      setRedeemed((prev) => new Set(prev).add(id));
      if (!token) return;
      markRedeemed(token, id);
      creationService
        .redeemCoupon(token, { couponId: id })
        .catch(() =>
          toast.error(
            "Couldn't reach them just now — but it's marked claimed.",
          ),
        );
    },
    [token],
  );

  const go = useCallback(
    (d: -1 | 1) => {
      setDir(d);
      setPage((p) => Math.min(Math.max(p + d, 0), total - 1));
    },
    [total],
  );

  if (!entered) return <AgeGate onEnter={() => setEntered(true)} />;

  return (
    <div className="flex w-full max-w-sm flex-col items-center">
      <header className="mb-5 text-center">
        <p className="text-xs font-medium tracking-[0.25em] text-[#ff8fae] uppercase">
          {content.ownerName ? `From ${content.ownerName}` : "For you"}
        </p>
        <h2 className="mt-1 font-display text-3xl text-white">
          {content.title || "Your coupon book"}
        </h2>
        {content.intro && (
          <p className="mt-2 text-sm leading-relaxed text-white/55">
            {content.intro}
          </p>
        )}
      </header>

      {total === 0 || !coupon ? (
        <p className="py-12 text-sm text-white/40">
          No coupons in this book yet.
        </p>
      ) : (
        <>
          {/* The book stage — one page at a time, flipping on navigation. */}
          <div
            className="relative grid h-[27rem] w-full place-items-center"
            style={{ perspective: 1600 }}
          >
            <AnimatePresence mode="wait" custom={dir}>
              <CouponPage
                key={coupon.id}
                coupon={coupon}
                assets={assets}
                number={index + 1}
                total={total}
                token={token}
                alreadyRedeemed={redeemed.has(coupon.id)}
                onReveal={() => onReveal(coupon.id)}
                dir={dir}
              />
            </AnimatePresence>
          </div>

          {/* Pager */}
          <div className="mt-5 flex w-full items-center justify-between gap-4">
            <PagerButton
              dir="prev"
              onClick={() => go(-1)}
              disabled={index === 0}
            />
            <div className="flex items-center gap-1.5">
              {coupons.map((c, i) => (
                <span
                  key={c.id}
                  className="size-1.5 rounded-full transition-colors"
                  style={{
                    background: redeemed.has(c.id)
                      ? "#ff5a6a"
                      : i === index
                        ? "rgba(255,255,255,0.85)"
                        : "rgba(255,255,255,0.22)",
                  }}
                  aria-hidden
                />
              ))}
            </div>
            <PagerButton
              dir="next"
              onClick={() => go(1)}
              disabled={index === total - 1}
            />
          </div>
          <p className="mt-2 text-xs font-medium tracking-[0.15em] text-white/40 uppercase">
            Coupon {index + 1} of {total}
          </p>
        </>
      )}
    </div>
  );
}

// ── One page of the book ─────────────────────────────────────────────
const pageVariants: Variants = {
  enter: (d: number) => ({
    rotateY: d > 0 ? 40 : -40,
    x: d > 0 ? 70 : -70,
    opacity: 0,
  }),
  center: { rotateY: 0, x: 0, opacity: 1 },
  exit: (d: number) => ({
    rotateY: d > 0 ? -40 : 40,
    x: d > 0 ? -70 : 70,
    opacity: 0,
  }),
};

function CouponPage({
  coupon,
  number,
  total,
  token,
  alreadyRedeemed,
  onReveal,
  dir,
  assets,
}: {
  coupon: Coupon;
  number: number;
  total: number;
  token?: string;
  alreadyRedeemed: boolean;
  onReveal: () => void;
  dir: number;
  assets?: Record<string, string>;
}) {
  // Frozen at mount: revealing updates the parent, but this page keeps showing
  // the scratch view so the foil's fade plays out instead of snapping away.
  const [startRevealed] = useState(alreadyRedeemed);

  return (
    <motion.div
      custom={dir}
      variants={pageVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{ type: "spring", stiffness: 260, damping: 28 }}
      className="absolute flex h-[26rem] w-[19rem] flex-col overflow-hidden rounded-[1.5rem] border border-white/12 bg-[#1c0a13] p-3 shadow-[0_24px_70px_rgba(0,0,0,0.55)] [transform-style:preserve-3d]"
    >
      {/* page header (no coupon detail — that's the surprise) */}
      <div className="flex items-center justify-between px-2 py-1.5">
        <span className="text-[0.6rem] font-semibold tracking-[0.3em] text-white/40 uppercase">
          Love Coupon
        </span>
        <span className="text-[0.6rem] font-semibold tracking-[0.2em] text-white/40 uppercase">
          № {number} / {total}
        </span>
      </div>

      {/* the scratch surface fills the page; the coupon hides beneath it */}
      <div className="relative mt-1.5 flex-1">
        {startRevealed ? (
          <RevealedCoupon coupon={coupon} token={token} assets={assets} />
        ) : (
          <ScratchToRedeem
            accent={HEAT_META[coupon.heat].accent}
            onComplete={onReveal}
            label="SCRATCH TO REVEAL"
            className="h-full"
          >
            <RevealedCoupon coupon={coupon} token={token} assets={assets} />
          </ScratchToRedeem>
        )}
      </div>
    </motion.div>
  );
}

// ── The coupon itself, revealed under the foil ───────────────────────
function RevealedCoupon({
  coupon,
  token,
  assets,
}: {
  coupon: Coupon;
  token?: string;
  assets?: Record<string, string>;
}) {
  const meta = HEAT_META[coupon.heat];
  return (
    <div
      className="flex h-full w-full flex-col rounded-[1.1rem] px-6 py-6"
      style={{ background: meta.card }}
    >
      <div className="flex items-center justify-between">
        <span className="text-[0.6rem] font-semibold tracking-[0.25em] text-white/45 uppercase">
          No expiry
        </span>
        <Flames heat={coupon.heat} />
      </div>

      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <h3 className="font-display text-2xl leading-tight text-white">
          {coupon.title || "Untitled coupon"}
        </h3>
        <CatalogImage fileId={coupon.image?.fileId} assets={assets} />
        {coupon.description && (
          <p className="mt-2 text-sm leading-relaxed text-white/65">
            {coupon.description}
          </p>
        )}
      </div>

      <div className="flex items-center justify-center gap-1.5 border-t border-dashed border-white/20 pt-3 text-xs font-medium text-white/55">
        <Check className="size-3.5" style={{ color: meta.accent }} />
        {token ? "Claimed — they've been told" : "Claimed"}
      </div>
    </div>
  );
}

function PagerButton({
  dir,
  onClick,
  disabled,
}: {
  dir: "prev" | "next";
  onClick: () => void;
  disabled: boolean;
}) {
  const Icon = dir === "prev" ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={dir === "prev" ? "Previous coupon" : "Next coupon"}
      className="grid size-11 place-items-center rounded-full border border-white/15 text-white/80 transition-colors hover:bg-white/10 disabled:opacity-30"
    >
      <Icon className="size-5" />
    </button>
  );
}

function AgeGate({ onEnter }: { onEnter: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex w-full max-w-sm flex-col items-center gap-5 rounded-3xl border border-white/10 bg-white/[0.04] px-7 py-10 text-center backdrop-blur"
    >
      <span className="grid size-14 place-items-center rounded-full bg-gradient-to-br from-[#ff4d6d] to-[#c81d4e] text-white shadow-lg">
        <Lock className="size-6" />
      </span>
      <div className="space-y-2">
        <h2 className="font-display text-2xl text-white">For grown-ups only</h2>
        <p className="text-sm leading-relaxed text-white/55">
          This is for consenting adults sharing a private moment. By entering
          you confirm you{"'"}re 18 or older and you both want to be here.
        </p>
      </div>
      <button
        type="button"
        onClick={onEnter}
        className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-3 text-sm font-semibold text-[#7e1426] transition-transform hover:scale-[1.03] active:scale-95"
      >
        <Flame className="size-4" /> We{"'"}re in
      </button>
    </motion.div>
  );
}
