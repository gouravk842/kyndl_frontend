"use client";

import { Loader2, Package, Plus, Search } from "lucide-react";
import { useMemo, useState } from "react";

import { ButtonLink } from "@/components/ui/button-link";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ROUTES } from "@/constants/routes";
import { ProductRow } from "@/features/vendor/components/product-row";
import { useDeleteVendorProduct, useVendorProducts } from "@/hooks/use-vendor";
import { cn } from "@/lib/utils";

const STATUS_FILTERS: { label: string; value: "all" | "active" | "hidden" }[] =
  [
    { label: "All", value: "all" },
    { label: "Active", value: "active" },
    { label: "Hidden", value: "hidden" },
  ];

export function VendorProducts() {
  const { data: products, isLoading } = useVendorProducts();
  const del = useDeleteVendorProduct();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"all" | "active" | "hidden">("all");

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return (products ?? []).filter((p) => {
      if (status === "active" && !p.is_active) return false;
      if (status === "hidden" && p.is_active) return false;
      if (!needle) return true;
      return (
        p.name.toLowerCase().includes(needle) ||
        (p.tagline ?? "").toLowerCase().includes(needle) ||
        (p.sku ?? "").toLowerCase().includes(needle)
      );
    });
  }, [products, q, status]);

  const hasCatalog = (products?.length ?? 0) > 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">
            Products
          </h1>
          <p className="mt-1 text-muted-foreground">
            Everything your shop sells.
          </p>
        </div>
        <ButtonLink href={ROUTES.shopProductNew}>
          <Plus className="size-4" /> Add product
        </ButtonLink>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20 text-muted-foreground">
          <Loader2 className="size-6 animate-spin" />
        </div>
      ) : !hasCatalog ? (
        <Card className="flex flex-col items-center gap-3 py-16 text-center">
          <Package className="size-9 text-muted-foreground" />
          <p className="font-display text-lg">No products yet</p>
          <p className="text-sm text-muted-foreground">
            List your first gift to start selling.
          </p>
          <ButtonLink href={ROUTES.shopProductNew} className="mt-2">
            <Plus className="size-4" /> Add product
          </ButtonLink>
        </Card>
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative min-w-[12rem] flex-1 sm:max-w-xs">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search name or SKU…"
                className="pl-8"
                aria-label="Search products"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {STATUS_FILTERS.map((f) => (
                <button
                  key={f.value}
                  type="button"
                  onClick={() => setStatus(f.value)}
                  className={cn(
                    "rounded-full border px-3.5 py-1.5 text-sm transition-colors",
                    status === f.value
                      ? "border-primary bg-primary text-primary-foreground"
                      : "hover:bg-accent",
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {filtered.length === 0 ? (
            <Card className="py-12 text-center">
              <p className="font-medium">No matching products</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Try a different search or status filter.
              </p>
            </Card>
          ) : (
            <div className="overflow-hidden rounded-xl border">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-left text-muted-foreground">
                  <tr>
                    <th className="p-3 font-medium">Product</th>
                    <th className="p-3 font-medium">Price</th>
                    <th className="p-3 font-medium">Stock</th>
                    <th className="p-3 font-medium">Status</th>
                    <th className="p-3" />
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p) => (
                    <ProductRow
                      key={p.slug}
                      product={p}
                      deleting={del.isPending}
                      onDelete={() => {
                        if (confirm(`Remove "${p.name}" from your shop?`)) {
                          del.mutate(p.slug);
                        }
                      }}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
