"use client";

import { Pencil, Trash2 } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button-link";
import { ROUTES } from "@/constants/routes";
import { usePatchVendorProduct } from "@/hooks/use-vendor";
import { cn } from "@/lib/utils";
import type { VendorProduct } from "@/types/vendor";

const cellInputClass =
  "h-8 min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50";

function rupeesDraft(paise: number): string {
  const rupees = paise / 100;
  return Number.isInteger(rupees) ? String(rupees) : rupees.toFixed(2);
}

export function ProductRow({
  product,
  onDelete,
  deleting,
}: {
  product: VendorProduct;
  onDelete: () => void;
  deleting: boolean;
}) {
  const patch = usePatchVendorProduct();
  const saving = patch.isPending;
  const [priceDraft, setPriceDraft] = useState(() =>
    rupeesDraft(product.price),
  );
  const [priceSnapshot, setPriceSnapshot] = useState(product.price);
  if (product.price !== priceSnapshot) {
    setPriceSnapshot(product.price);
    setPriceDraft(rupeesDraft(product.price));
  }

  const [stockDraft, setStockDraft] = useState(() => String(product.stock));
  const [stockSnapshot, setStockSnapshot] = useState(product.stock);
  if (product.stock !== stockSnapshot) {
    setStockSnapshot(product.stock);
    setStockDraft(String(product.stock));
  }

  const commitPrice = () => {
    const rupees = Number(priceDraft);
    if (!Number.isFinite(rupees) || rupees <= 0) {
      setPriceDraft(rupeesDraft(product.price));
      return;
    }
    const paise = Math.round(rupees * 100);
    if (paise === product.price) {
      setPriceDraft(rupeesDraft(product.price));
      return;
    }
    patch.mutate({ slug: product.slug, price: paise });
  };

  const commitStock = () => {
    const stock = Number.parseInt(stockDraft, 10);
    if (!Number.isInteger(stock) || stock < 0) {
      setStockDraft(String(product.stock));
      return;
    }
    if (stock === product.stock) {
      setStockDraft(String(product.stock));
      return;
    }
    patch.mutate({ slug: product.slug, stock });
  };

  return (
    <tr className={cn("border-t", saving && "opacity-70")} aria-busy={saving}>
      <td className="p-3">
        <div className="flex items-center gap-3">
          <span className="size-10 shrink-0 overflow-hidden rounded-lg bg-muted">
            {product.image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={product.image_url}
                alt=""
                className="size-full object-cover"
              />
            ) : null}
          </span>
          <span className="min-w-0">
            <span className="block font-medium">{product.name}</span>
            {product.sku ? (
              <span className="block truncate text-xs text-muted-foreground">
                {product.sku}
              </span>
            ) : null}
          </span>
        </div>
      </td>
      <td className="p-3">
        <div className="flex items-center gap-1">
          <span className="text-muted-foreground">₹</span>
          <input
            type="number"
            min="0.01"
            step="0.01"
            value={priceDraft}
            disabled={saving}
            onChange={(e) => setPriceDraft(e.target.value)}
            onBlur={commitPrice}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                commitPrice();
                e.currentTarget.blur();
              }
              if (e.key === "Escape") {
                setPriceDraft(rupeesDraft(product.price));
                e.currentTarget.blur();
              }
            }}
            className={cn(cellInputClass, "w-24")}
            aria-label={`Price for ${product.name}`}
          />
        </div>
      </td>
      <td className="p-3">
        <input
          type="number"
          min="0"
          step="1"
          value={stockDraft}
          disabled={saving}
          onChange={(e) => setStockDraft(e.target.value)}
          onBlur={commitStock}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              commitStock();
              e.currentTarget.blur();
            }
            if (e.key === "Escape") {
              setStockDraft(String(product.stock));
              e.currentTarget.blur();
            }
          }}
          className={cn(
            cellInputClass,
            "w-20",
            product.stock === 0 && "text-destructive",
          )}
          aria-label={`Stock for ${product.name}`}
        />
      </td>
      <td className="p-3">
        <select
          value={product.is_active ? "active" : "hidden"}
          disabled={saving}
          onChange={(e) => {
            const is_active = e.target.value === "active";
            if (is_active === product.is_active) return;
            patch.mutate({ slug: product.slug, is_active });
          }}
          aria-label={`Status for ${product.name}`}
          className={cn(
            "rounded-full border-0 px-2 py-1 text-xs outline-none",
            "focus-visible:ring-3 focus-visible:ring-ring/50",
            product.is_active
              ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
              : "bg-muted text-muted-foreground",
          )}
        >
          <option value="active">Active</option>
          <option value="hidden">Hidden</option>
        </select>
      </td>
      <td className="p-3">
        <div className="flex items-center justify-end gap-1">
          <ButtonLink
            href={`${ROUTES.shopProducts}/${product.slug}`}
            variant="ghost"
            size="icon-sm"
            aria-label={`Edit ${product.name}`}
          >
            <Pencil className="size-4" />
          </ButtonLink>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`Delete ${product.name}`}
            disabled={deleting || saving}
            onClick={onDelete}
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      </td>
    </tr>
  );
}
