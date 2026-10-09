"use client";

import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { ActivityBankPicker } from "@/features/activity-bank/components/activity-bank-picker";
import { heatForType, titled } from "@/features/activity-bank/map";
import { fileRef } from "@/features/activity-bank/previews";
import { Flames } from "@/features/desire-deck/components/flames";

import { type Coupon, type Heat, HEAT_META, HEAT_ORDER } from "../../config";
import { couponHeatDefault, useBuilderStore } from "../../store/builder.store";

interface FormState {
  title: string;
  description: string;
  heat: Heat;
  image: { fileId: string } | null;
}

/** Add / edit a coupon — its title, the fine print, and a heat tier. */
export function CouponFormModal({
  coupon,
  onClose,
}: {
  coupon: Coupon | null;
  onClose: () => void;
}) {
  const coupons = useBuilderStore((s) => s.doc.coupons);
  const addCoupon = useBuilderStore((s) => s.addCoupon);
  const updateCoupon = useBuilderStore((s) => s.updateCoupon);

  const [form, setForm] = useState<FormState>(() =>
    coupon
      ? {
          title: coupon.title,
          description: coupon.description,
          heat: coupon.heat,
          image: coupon.image ?? null,
        }
      : {
          title: "",
          description: "",
          heat: couponHeatDefault(coupons.length),
          image: null,
        },
  );
  const [bankOpen, setBankOpen] = useState(false);
  const patch = (p: Partial<FormState>) => setForm((f) => ({ ...f, ...p }));

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const onSave = () => {
    if (!form.title.trim()) {
      toast.error("Give this coupon a title.");
      return;
    }
    const data = {
      title: form.title.trim(),
      description: form.description.trim(),
      heat: form.heat,
      image: form.image,
    };
    if (coupon) updateCoupon(coupon.id, data);
    else addCoupon(data);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#1a0a13] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <h2 className="font-display text-lg text-white">
            {coupon ? "Edit coupon" : "Add a coupon"}
          </h2>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="grid size-8 place-items-center rounded-full text-white/50 hover:bg-white/10 hover:text-white"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="space-y-5 overflow-y-auto px-5 py-5">
          <button
            type="button"
            onClick={() => setBankOpen(true)}
            className="rounded-full border border-white/20 px-3 py-1.5 text-xs font-semibold text-white/80 hover:bg-white/10"
          >
            Use a bank line
          </button>
          <Field label="Coupon title">
            <input
              className={inputCls}
              value={form.title}
              onChange={(e) => patch({ title: e.target.value })}
              placeholder="One slow dance"
            />
          </Field>

          <Field label="The fine print (optional)">
            <textarea
              className={`${inputCls} min-h-[90px] resize-y`}
              value={form.description}
              onChange={(e) => patch({ description: e.target.value })}
              placeholder="What this coupon actually gets them…"
            />
          </Field>

          <Field label="Heat">
            <div className="grid grid-cols-2 gap-2">
              {HEAT_ORDER.map((h) => {
                const meta = HEAT_META[h];
                const active = form.heat === h;
                return (
                  <button
                    key={h}
                    type="button"
                    onClick={() => patch({ heat: h })}
                    className={[
                      "flex items-center justify-between gap-2 rounded-lg border px-3 py-2 text-sm transition-colors",
                      active
                        ? "border-transparent text-white"
                        : "border-white/12 text-white/55 hover:border-white/25",
                    ].join(" ")}
                    style={active ? { background: meta.card } : undefined}
                  >
                    <span className="font-medium">{meta.label}</span>
                    <Flames heat={h} />
                  </button>
                );
              })}
            </div>
          </Field>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-white/10 px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full px-4 py-2 text-sm font-medium text-white/60 hover:bg-white/10"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onSave}
            className="rounded-full bg-gradient-to-r from-[#ff4d6d] to-[#c81d4e] px-5 py-2 text-sm font-semibold text-white transition-transform hover:scale-[1.03]"
          >
            {coupon ? "Save changes" : "Add coupon"}
          </button>
        </div>
      </div>
      <ActivityBankPicker
        open={bankOpen}
        includeAdult
        initialKind="dare"
        onClose={() => setBankOpen(false)}
        onPick={(picked) => {
          const item = picked[0];
          if (!item) return;
          const image = fileRef(item);
          const { title, body } = titled(item);
          setForm((current) => ({
            ...current,
            title,
            description: body,
            heat: heatForType(item.type.slug),
            image: image ?? null,
          }));
        }}
      />
    </div>
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
      <span className="mb-1.5 block text-xs font-medium tracking-wide text-white/50">
        {label}
      </span>
      {children}
    </label>
  );
}
