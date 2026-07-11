"use client";

import { Loader2 } from "lucide-react";

import { ProductForm } from "@/features/vendor/components/product-form";
import { useVendorProduct } from "@/hooks/use-vendor";

export function EditProduct({ slug }: { slug: string }) {
  const { data: product, isLoading, isError } = useVendorProduct(slug);

  if (isLoading) {
    return (
      <div className="flex justify-center py-24 text-muted-foreground">
        <Loader2 className="size-6 animate-spin" />
      </div>
    );
  }

  if (isError || !product) {
    return <p className="py-24 text-center text-muted-foreground">Product not found.</p>;
  }

  return <ProductForm existing={product} />;
}
