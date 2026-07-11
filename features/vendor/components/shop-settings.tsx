"use client";

import { Loader2 } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUpdateVendorProfile, useVendorProfile } from "@/hooks/use-vendor";
import type { Vendor } from "@/types/vendor";

export function ShopSettings() {
  const { data: vendor } = useVendorProfile();

  if (!vendor) {
    return (
      <div className="flex justify-center py-24 text-muted-foreground">
        <Loader2 className="size-6 animate-spin" />
      </div>
    );
  }
  // Keyed remount seeds the form's initial state from the loaded shop (no effect).
  return <SettingsForm key={vendor.id} vendor={vendor} />;
}

function SettingsForm({ vendor }: { vendor: Vendor }) {
  const update = useUpdateVendorProfile();

  const [form, setForm] = useState({
    description: vendor.description ?? "",
    support_email: vendor.support_email ?? "",
    support_phone: vendor.support_phone ?? "",
    // Shipping is edited in rupees; converted to paise on save.
    flat_shipping_rupees: String((vendor.flat_shipping_fee ?? 0) / 100),
    free_shipping_rupees: String((vendor.free_shipping_threshold ?? 0) / 100),
  });

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    update.mutate({
      description: form.description,
      support_email: form.support_email,
      support_phone: form.support_phone,
      flat_shipping_fee: Math.round(Number(form.flat_shipping_rupees || 0) * 100),
      free_shipping_threshold: Math.round(Number(form.free_shipping_rupees || 0) * 100),
    });
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">Shop settings</h1>
        <p className="mt-1 text-muted-foreground">
          Your storefront details and shipping rules
          {vendor ? ` · ${vendor.commission_percent}% platform fee (set by Kyndl)` : ""}.
        </p>
      </div>

      <form onSubmit={onSubmit}>
        <Card className="space-y-5 p-6">
          <div className="space-y-2">
            <Label>About your shop</Label>
            <textarea
              value={form.description}
              onChange={set("description")}
              rows={3}
              className="w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
              placeholder="A line or two about what you make…"
            />
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Support email</Label>
              <Input type="email" value={form.support_email} onChange={set("support_email")} />
            </div>
            <div className="space-y-2">
              <Label>Support phone</Label>
              <Input value={form.support_phone} onChange={set("support_phone")} />
            </div>
          </div>

          <div className="border-t pt-5">
            <h2 className="font-heading text-base font-medium">Shipping</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Charged per order from your shop. You keep this — the platform fee applies only to
              the items.
            </p>
            <div className="mt-4 grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Shipping fee (₹)</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.flat_shipping_rupees}
                  onChange={set("flat_shipping_rupees")}
                />
              </div>
              <div className="space-y-2">
                <Label>Free shipping over (₹)</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.free_shipping_rupees}
                  onChange={set("free_shipping_rupees")}
                />
                <p className="text-xs text-muted-foreground">Set to 0 to never offer free shipping.</p>
              </div>
            </div>
          </div>
        </Card>

        <Button type="submit" className="mt-5" disabled={update.isPending}>
          {update.isPending && <Loader2 className="size-4 animate-spin" />}
          Save settings
        </Button>
      </form>
    </div>
  );
}
