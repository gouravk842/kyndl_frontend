"use client";

import { Eye, Pencil, Plus, Sparkles, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { ROUTES } from "@/constants/routes";
import {
  BuilderShell,
  type BuilderTab,
} from "@/features/dashboard/components/builder-shell";
import type { LoveCouponsSync } from "@/hooks/use-love-coupons-sync";

import { type Coupon, HEAT_META } from "../../config";
import { useBuilderStore } from "../../store/builder.store";
import { CouponFormModal } from "./coupon-form-modal";

export function BuilderPanel({
  sync,
  onPreview,
  className,
}: {
  sync: LoveCouponsSync;
  onPreview?: () => void;
  className?: string;
}) {
  const doc = useBuilderStore((s) => s.doc);
  const setMeta = useBuilderStore((s) => s.setMeta);
  const moveCoupon = useBuilderStore((s) => s.moveCoupon);
  const removeCoupon = useBuilderStore((s) => s.removeCoupon);

  const [form, setForm] = useState<{ coupon: Coupon | null } | null>(null);
  const coupons = doc.coupons;

  const tabs: BuilderTab[] = [
    {
      key: "booklet",
      label: "Booklet",
      content: (
        <div className="space-y-7">
          {(onPreview || sync.creationId) && (
            <div className="flex flex-wrap items-center gap-3">
              {onPreview && (
                <button
                  type="button"
                  onClick={onPreview}
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-3 py-1.5 text-sm font-medium text-white/70 transition-colors hover:bg-white/10"
                >
                  <Eye className="size-3.5" /> Preview
                </button>
              )}
              {sync.creationId && (
                <Link
                  href={`${ROUTES.loveCouponsRedemptions}?id=${sync.creationId}`}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-[#ff8fae] hover:underline"
                >
                  <Sparkles className="size-3.5" /> See what they&apos;ve
                  redeemed
                </Link>
              )}
            </div>
          )}

          <Section title="The booklet">
            <Field label="Their name (who you're sending it to)">
              <input
                className={inputCls}
                value={doc.recipientName}
                onChange={(e) => setMeta({ recipientName: e.target.value })}
                placeholder="you"
              />
            </Field>
            <Field label="Your name (shown to them)">
              <input
                className={inputCls}
                value={doc.ownerName}
                onChange={(e) => setMeta({ ownerName: e.target.value })}
                placeholder="me"
              />
            </Field>
            <Field label="Title">
              <input
                className={inputCls}
                value={doc.title}
                onChange={(e) => setMeta({ title: e.target.value })}
                placeholder="Your coupon book"
              />
            </Field>
            <Field label="Intro message">
              <textarea
                className={`${inputCls} min-h-[80px] resize-y`}
                value={doc.intro}
                onChange={(e) => setMeta({ intro: e.target.value })}
                placeholder="Shown at the top of the booklet…"
              />
            </Field>
          </Section>

          <Section
            title={`Coupons (${coupons.length})`}
            action={
              <button
                type="button"
                onClick={() => setForm({ coupon: null })}
                className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-[#ff4d6d] to-[#c81d4e] px-3 py-1.5 text-xs font-semibold text-white transition-transform hover:scale-[1.04]"
              >
                <Plus className="size-3.5" /> Add coupon
              </button>
            }
          >
            <ul className="space-y-1.5">
              {coupons.map((c, i) => (
                <li key={c.id}>
                  <CouponRow
                    coupon={c}
                    isFirst={i === 0}
                    isLast={i === coupons.length - 1}
                    onEdit={() => setForm({ coupon: c })}
                    onUp={() => moveCoupon(c.id, -1)}
                    onDown={() => moveCoupon(c.id, 1)}
                    onRemove={() => removeCoupon(c.id)}
                  />
                </li>
              ))}
              {coupons.length === 0 && (
                <li className="rounded-lg border border-dashed border-white/12 px-3 py-8 text-center text-sm text-white/40">
                  No coupons yet — tap{" "}
                  <span className="font-semibold text-[#ff8fae]">
                    Add coupon
                  </span>{" "}
                  to write the first one.
                </li>
              )}
            </ul>
          </Section>
        </div>
      ),
    },
  ];

  return (
    <>
      <BuilderShell
        title="Build your booklet"
        sync={sync}
        tabs={tabs}
        className={className}
      />
      {form && (
        <CouponFormModal coupon={form.coupon} onClose={() => setForm(null)} />
      )}
    </>
  );
}

function CouponRow({
  coupon,
  isFirst,
  isLast,
  onEdit,
  onUp,
  onDown,
  onRemove,
}: {
  coupon: Coupon;
  isFirst: boolean;
  isLast: boolean;
  onEdit: () => void;
  onUp: () => void;
  onDown: () => void;
  onRemove: () => void;
}) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-2 transition-colors hover:border-white/20">
      <span
        className="size-2.5 shrink-0 rounded-full"
        style={{ background: HEAT_META[coupon.heat].accent }}
        aria-hidden
      />
      <button type="button" onClick={onEdit} className="min-w-0 flex-1 text-left">
        <span className="block truncate text-sm font-medium text-white/90">
          {coupon.title || "Untitled coupon"}
        </span>
        {coupon.description && (
          <span className="block truncate text-xs text-white/40">
            {coupon.description}
          </span>
        )}
      </button>
      <div className="flex shrink-0 items-center">
        <IconBtn label="Move up" onClick={onUp} disabled={isFirst}>
          ↑
        </IconBtn>
        <IconBtn label="Move down" onClick={onDown} disabled={isLast}>
          ↓
        </IconBtn>
        <button
          type="button"
          aria-label="Edit coupon"
          onClick={onEdit}
          className="grid size-7 place-items-center rounded-md text-white/50 hover:bg-white/10 hover:text-[#ff8fae]"
        >
          <Pencil className="size-3.5" />
        </button>
        <button
          type="button"
          aria-label="Delete coupon"
          onClick={onRemove}
          className="grid size-7 place-items-center rounded-md text-white/40 hover:bg-white/10 hover:text-[#ff6f6f]"
        >
          <Trash2 className="size-3.5" />
        </button>
      </div>
    </div>
  );
}

function IconBtn({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className="grid size-7 place-items-center rounded-md text-sm text-white/50 hover:bg-white/10 disabled:opacity-30"
    >
      {children}
    </button>
  );
}

const inputCls =
  "w-full rounded-lg border border-white/12 bg-white/5 px-3 py-2 text-sm text-white outline-none transition-colors placeholder:text-white/30 focus:border-[#ff4d6d] focus:ring-2 focus:ring-[#ff4d6d]/25";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium tracking-wide text-white/50">
        {label}
      </span>
      {children}
    </label>
  );
}

function Section({
  title,
  action,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold tracking-wide text-white/80 uppercase">
          {title}
        </h2>
        {action}
      </div>
      {children}
    </section>
  );
}
