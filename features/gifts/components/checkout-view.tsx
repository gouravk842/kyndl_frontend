"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Gift, Loader2, Lock, Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { PageContainer } from "@/components/layout/page-container";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ROUTES } from "@/constants/routes";
import {
  type ShippingFormValues,
  shippingSchema,
} from "@/features/gifts/schemas/checkout.schema";
import {
  useAddresses,
  useCartQuote,
  useGiftCheckout,
  useSaveAddress,
} from "@/hooks/use-gifts";
import { formatPrice } from "@/lib/gifts";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth.store";
import { cartSubtotal, useCartStore } from "@/store/cart.store";
import type { Address, ShippingAddress } from "@/types/gift";

export function CheckoutView() {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const isHydrated = useCartStore((s) => s.isHydrated);
  const clear = useCartStore((s) => s.clear);
  const user = useAuthStore((s) => s.user);

  const checkout = useGiftCheckout();
  const saveAddress = useSaveAddress();
  const { data: addresses } = useAddresses();

  const cartLines = useMemo(
    () => items.map((i) => ({ slug: i.slug, quantity: i.quantity })),
    [items],
  );
  const { data: quote, isLoading: quoteLoading } = useCartQuote(cartLines);

  // Address selection: a saved address id, or "new".
  const [selected, setSelected] = useState<string>("new");
  const [saveNew, setSaveNew] = useState(true);

  // Default to the user's first saved address once they load.
  const effectiveSelected =
    selected === "new" && addresses && addresses.length > 0
      ? (addresses[0]?.id ?? selected)
      : selected;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ShippingFormValues>({
    resolver: zodResolver(shippingSchema),
    defaultValues: {
      full_name: user ? `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim() : "",
      phone: "",
      line1: "",
      line2: "",
      city: "",
      state: "",
      postal_code: "",
      country: "IN",
    },
  });

  const subtotal = quote?.subtotal ?? cartSubtotal(items);
  const shipping = quote?.shipping;
  const total = quote?.total ?? subtotal;

  if (isHydrated && items.length === 0 && !checkout.isSuccess) {
    return (
      <PageContainer size="md" className="py-24 text-center">
        <Gift className="mx-auto size-10 text-[#E3A78C]" />
        <h1 className="mt-4 font-display text-2xl text-[#3A2A25]">Your gift bag is empty</h1>
        <p className="mt-2 text-[#7A6258]">Pick something lovely first.</p>
        <Link
          href={ROUTES.gifts}
          className="mt-6 inline-flex h-11 items-center rounded-full bg-gradient-to-r from-[#FF7A59] to-[#F2596F] px-6 text-sm font-medium text-white kyndl-glow-warm"
        >
          Browse gifts
        </Link>
      </PageContainer>
    );
  }

  const pay = (shippingData: ShippingAddress) => {
    checkout.mutate(
      {
        items: cartLines,
        shipping: shippingData,
        prefill: { name: shippingData.full_name, email: user?.email },
      },
      {
        onSuccess: () => {
          clear();
          toast.success("Order confirmed — a receipt is on its way 🎁");
          router.push(ROUTES.giftOrders);
        },
      },
    );
  };

  // Pay with a saved address.
  const paySaved = (address: Address) => {
    pay({
      full_name: address.full_name,
      phone: address.phone,
      line1: address.line1,
      line2: address.line2,
      city: address.city,
      state: address.state,
      postal_code: address.postal_code,
      country: address.country,
    });
  };

  // Pay with the new-address form (optionally saving it first).
  const payNew = (values: ShippingFormValues) => {
    if (saveNew) {
      saveAddress.mutate({
        full_name: values.full_name,
        phone: values.phone,
        line1: values.line1,
        line2: values.line2 ?? "",
        city: values.city,
        state: values.state,
        postal_code: values.postal_code,
        country: values.country ?? "IN",
        is_default: false,
      });
    }
    pay(values);
  };

  const isNew = effectiveSelected === "new";
  const busy = checkout.isPending;

  const payButton = (
    <button
      type="submit"
      disabled={busy}
      className={cn(
        "mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-full text-base font-medium text-white",
        "bg-gradient-to-r from-[#FF7A59] to-[#F2596F] kyndl-glow-warm transition-all duration-300 hover:-translate-y-0.5",
        "disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0",
      )}
    >
      {busy ? (
        <>
          <Loader2 className="size-4 animate-spin" /> Opening secure checkout…
        </>
      ) : (
        <>
          <Lock className="size-4" /> Pay {formatPrice(total)}
        </>
      )}
    </button>
  );

  return (
    <PageContainer size="xl" className="py-12 md:py-16">
      <h1 className="font-display text-3xl text-[#3A2A25] md:text-4xl">Checkout</h1>
      <p className="mt-2 text-[#7A6258]">Almost there — tell us where it should land.</p>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1.4fr_1fr]">
        {/* ── Address ───────────────────────────────────────────── */}
        <div className="order-2 lg:order-1">
          {/* Saved addresses */}
          {addresses && addresses.length > 0 && (
            <div className="mb-4 space-y-3">
              {addresses.map((addr) => (
                <button
                  key={addr.id}
                  type="button"
                  onClick={() => setSelected(addr.id)}
                  className={cn(
                    "flex w-full items-start gap-3 rounded-2xl border p-4 text-left transition-colors",
                    effectiveSelected === addr.id
                      ? "border-[#FF7A59] bg-[#FFF7F1]"
                      : "border-[#F4DDD0] bg-white hover:border-[#FF7A59]/50",
                  )}
                >
                  <span
                    className={cn(
                      "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border",
                      effectiveSelected === addr.id
                        ? "border-[#FF7A59] bg-[#FF7A59] text-white"
                        : "border-[#E3CDBE]",
                    )}
                  >
                    {effectiveSelected === addr.id && <Check className="size-3" />}
                  </span>
                  <span className="text-sm text-[#3A2A25]">
                    <span className="font-medium">{addr.full_name}</span> · {addr.phone}
                    <br />
                    <span className="text-[#7A6258]">
                      {addr.line1}
                      {addr.line2 ? `, ${addr.line2}` : ""}, {addr.city}, {addr.state}{" "}
                      {addr.postal_code}
                    </span>
                  </span>
                </button>
              ))}
              <button
                type="button"
                onClick={() => setSelected("new")}
                className={cn(
                  "flex w-full items-center gap-2 rounded-2xl border p-4 text-sm transition-colors",
                  isNew
                    ? "border-[#FF7A59] bg-[#FFF7F1] text-[#C75B39]"
                    : "border-[#F4DDD0] bg-white text-[#7A6258] hover:border-[#FF7A59]/50",
                )}
              >
                <Plus className="size-4" /> Use a new address
              </button>
            </div>
          )}

          {/* New-address form OR pay-with-saved button */}
          {isNew ? (
            <form onSubmit={handleSubmit(payNew)}>
              <div className="rounded-3xl border border-[#F4DDD0] bg-white p-6 md:p-8">
                <h2 className="font-display text-xl text-[#3A2A25]">Shipping address</h2>
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <Field label="Full name" error={errors.full_name?.message} className="sm:col-span-2">
                    <Input {...register("full_name")} autoComplete="name" />
                  </Field>
                  <Field label="Phone" error={errors.phone?.message}>
                    <Input {...register("phone")} autoComplete="tel" inputMode="tel" />
                  </Field>
                  <Field label="Postal code" error={errors.postal_code?.message}>
                    <Input {...register("postal_code")} autoComplete="postal-code" />
                  </Field>
                  <Field label="Address line 1" error={errors.line1?.message} className="sm:col-span-2">
                    <Input {...register("line1")} autoComplete="address-line1" />
                  </Field>
                  <Field label="Address line 2 (optional)" error={errors.line2?.message} className="sm:col-span-2">
                    <Input {...register("line2")} autoComplete="address-line2" />
                  </Field>
                  <Field label="City" error={errors.city?.message}>
                    <Input {...register("city")} autoComplete="address-level2" />
                  </Field>
                  <Field label="State" error={errors.state?.message}>
                    <Input {...register("state")} autoComplete="address-level1" />
                  </Field>
                </div>
                <label className="mt-5 flex items-center gap-2 text-sm text-[#7A6258]">
                  <input
                    type="checkbox"
                    checked={saveNew}
                    onChange={(e) => setSaveNew(e.target.checked)}
                    className="size-4"
                  />
                  Save this address for next time
                </label>
              </div>
              {payButton}
              <p className="mt-3 text-center text-xs text-[#B08C7D]">
                Payments are processed securely by Razorpay.
              </p>
            </form>
          ) : (
            <div>
              <button
                type="button"
                disabled={busy}
                onClick={() => {
                  const addr = addresses?.find((a) => a.id === effectiveSelected);
                  if (addr) paySaved(addr);
                }}
                className={cn(
                  "flex h-12 w-full items-center justify-center gap-2 rounded-full text-base font-medium text-white",
                  "bg-gradient-to-r from-[#FF7A59] to-[#F2596F] kyndl-glow-warm transition-all duration-300 hover:-translate-y-0.5",
                  "disabled:cursor-not-allowed disabled:opacity-60",
                )}
              >
                {busy ? (
                  <>
                    <Loader2 className="size-4 animate-spin" /> Opening secure checkout…
                  </>
                ) : (
                  <>
                    <Lock className="size-4" /> Pay {formatPrice(total)}
                  </>
                )}
              </button>
              <p className="mt-3 text-center text-xs text-[#B08C7D]">
                Payments are processed securely by Razorpay.
              </p>
            </div>
          )}
        </div>

        {/* ── Order summary ─────────────────────────────────────── */}
        <aside className="order-1 lg:order-2">
          <div className="rounded-3xl border border-[#F4DDD0] bg-[#FFF7F1] p-6 md:sticky md:top-24">
            <h2 className="font-display text-xl text-[#3A2A25]">Your order</h2>
            <ul className="mt-5 flex flex-col gap-4">
              {items.map((item) => (
                <li key={item.slug} className="flex items-center gap-3">
                  <span className="relative size-14 shrink-0 overflow-hidden rounded-xl bg-[#FDEBE6]">
                    {item.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.image_url} alt={item.name} className="size-full object-cover" />
                    ) : null}
                    <span className="absolute -right-1.5 -top-1.5 flex size-5 items-center justify-center rounded-full bg-[#3A2A25] text-[11px] font-bold text-white">
                      {item.quantity}
                    </span>
                  </span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-[#3A2A25]">{item.name}</p>
                  </div>
                  <span className="text-sm text-[#3A2A25]">
                    {formatPrice(item.price * item.quantity, item.currency)}
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-6 space-y-2 border-t border-[#F4DDD0] pt-4 text-sm">
              <Row label="Subtotal" value={formatPrice(subtotal)} />
              <Row
                label="Shipping"
                value={
                  quoteLoading
                    ? "…"
                    : shipping === 0
                      ? "Free"
                      : shipping !== undefined
                        ? formatPrice(shipping)
                        : "—"
                }
              />
              {quote && quote.vendor_lines.length > 1 && (
                <p className="pt-1 text-xs text-[#B08C7D]">
                  Shipping is charged per shop ({quote.vendor_lines.length} shops in this order).
                </p>
              )}
              <div className="flex items-center justify-between pt-2 font-display text-lg text-[#3A2A25]">
                <span>Total</span>
                <span>{quoteLoading ? "…" : formatPrice(total)}</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </PageContainer>
  );
}

function Field({
  label,
  error,
  className,
  children,
}: {
  label: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("space-y-2", className)}>
      <Label>{label}</Label>
      {children}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-[#7A6258]">
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}
