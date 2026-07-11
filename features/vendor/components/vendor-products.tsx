"use client";

import { Loader2, Package, Pencil, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button-link";
import { Card } from "@/components/ui/card";
import { ROUTES } from "@/constants/routes";
import { useDeleteVendorProduct, useVendorProducts } from "@/hooks/use-vendor";
import { formatPrice } from "@/lib/gifts";
import { cn } from "@/lib/utils";

export function VendorProducts() {
  const { data: products, isLoading } = useVendorProducts();
  const del = useDeleteVendorProduct();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">Products</h1>
          <p className="mt-1 text-muted-foreground">Everything your shop sells.</p>
        </div>
        <ButtonLink href={ROUTES.shopProductNew}>
          <Plus className="size-4" /> Add product
        </ButtonLink>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20 text-muted-foreground">
          <Loader2 className="size-6 animate-spin" />
        </div>
      ) : !products || products.length === 0 ? (
        <Card className="flex flex-col items-center gap-3 py-16 text-center">
          <Package className="size-9 text-muted-foreground" />
          <p className="font-display text-lg">No products yet</p>
          <p className="text-sm text-muted-foreground">List your first gift to start selling.</p>
          <ButtonLink href={ROUTES.shopProductNew} className="mt-2">
            <Plus className="size-4" /> Add product
          </ButtonLink>
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
              {products.map((p) => (
                <tr key={p.slug} className="border-t">
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <span className="size-10 shrink-0 overflow-hidden rounded-lg bg-muted">
                        {p.image_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={p.image_url} alt="" className="size-full object-cover" />
                        ) : null}
                      </span>
                      <span className="font-medium">{p.name}</span>
                    </div>
                  </td>
                  <td className="p-3">{formatPrice(p.price, p.currency)}</td>
                  <td className="p-3">
                    <span className={cn(p.stock === 0 && "text-destructive")}>{p.stock}</span>
                  </td>
                  <td className="p-3">
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-xs",
                        p.is_active
                          ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                          : "bg-muted text-muted-foreground",
                      )}
                    >
                      {p.is_active ? "Active" : "Hidden"}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center justify-end gap-1">
                      <ButtonLink
                        href={`${ROUTES.shopProducts}/${p.slug}`}
                        variant="ghost"
                        size="icon-sm"
                        aria-label="Edit"
                      >
                        <Pencil className="size-4" />
                      </ButtonLink>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label="Delete"
                        disabled={del.isPending}
                        onClick={() => {
                          if (confirm(`Remove "${p.name}" from your shop?`)) del.mutate(p.slug);
                        }}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
