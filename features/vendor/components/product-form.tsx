"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ImagePlus, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ROUTES } from "@/constants/routes";
import { useCreateVendorProduct, useUpdateVendorProduct } from "@/hooks/use-vendor";
import { cn } from "@/lib/utils";
import { fileService } from "@/services/files/file.service";
import type { VendorProduct, VendorProductInput } from "@/types/vendor";

const schema = z.object({
  name: z.string().min(2, "Give your product a name."),
  tagline: z.string().max(200).optional(),
  description: z.string().max(4000).optional(),
  price_rupees: z.coerce.number().positive("Enter a price above zero."),
  stock: z.coerce.number().int().min(0, "Stock can't be negative."),
  category: z.string().max(60).optional(),
  is_active: z.boolean(),
});

type FormValues = z.input<typeof schema>;

export function ProductForm({ existing }: { existing?: VendorProduct }) {
  const router = useRouter();
  const isEdit = Boolean(existing);
  const create = useCreateVendorProduct();
  const update = useUpdateVendorProduct(existing?.slug ?? "");

  const [imageFileId, setImageFileId] = useState<string | null>(existing?.image_file_id ?? null);
  const [imagePreview, setImagePreview] = useState<string>(existing?.image_url ?? "");
  const [uploading, setUploading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: existing?.name ?? "",
      tagline: existing?.tagline ?? "",
      description: existing?.description ?? "",
      price_rupees: existing ? existing.price / 100 : ("" as unknown as number),
      stock: existing?.stock ?? 0,
      category: existing?.category ?? "",
      is_active: existing?.is_active ?? true,
    },
  });

  const onPickImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fileId = await fileService.upload(file, "gift-product");
      setImageFileId(fileId);
      setImagePreview(URL.createObjectURL(file));
    } catch {
      toast.error("Could not upload that image. Please try another.");
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = (values: FormValues) => {
    const parsed = schema.parse(values);
    const payload: VendorProductInput = {
      name: parsed.name,
      tagline: parsed.tagline,
      description: parsed.description,
      price: Math.round(parsed.price_rupees * 100),
      stock: parsed.stock,
      category: parsed.category,
      is_active: parsed.is_active,
      image_file_id: imageFileId,
    };

    if (isEdit && existing) {
      update.mutate(payload, { onSuccess: () => router.push(ROUTES.shopProducts) });
    } else {
      create.mutate(payload, { onSuccess: () => router.push(ROUTES.shopProducts) });
    }
  };

  const saving = create.isPending || update.isPending;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">
          {isEdit ? "Edit product" : "New product"}
        </h1>
        <p className="mt-1 text-muted-foreground">
          {isEdit ? "Update the details shoppers see." : "List a new gift in your shop."}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card className="space-y-5 p-6">
          {/* Image */}
          <div className="space-y-2">
            <Label>Product image</Label>
            <div className="flex items-center gap-4">
              <div className="flex size-24 shrink-0 items-center justify-center overflow-hidden rounded-xl border bg-muted">
                {imagePreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={imagePreview} alt="" className="size-full object-cover" />
                ) : (
                  <ImagePlus className="size-6 text-muted-foreground" />
                )}
              </div>
              <label
                className={cn(
                  "inline-flex h-9 cursor-pointer items-center gap-2 rounded-md border px-3 text-sm",
                  "hover:bg-accent",
                  uploading && "pointer-events-none opacity-60",
                )}
              >
                {uploading ? <Loader2 className="size-4 animate-spin" /> : <ImagePlus className="size-4" />}
                {uploading ? "Uploading…" : "Upload image"}
                <input type="file" accept="image/*" className="hidden" onChange={onPickImage} />
              </label>
            </div>
          </div>

          <Field label="Name" error={errors.name?.message}>
            <Input {...register("name")} placeholder="Cozy soy candle" />
          </Field>
          <Field label="Tagline" error={errors.tagline?.message}>
            <Input {...register("tagline")} placeholder="A warm little glow for cold evenings" />
          </Field>
          <Field label="Description" error={errors.description?.message}>
            <textarea
              {...register("description")}
              rows={4}
              className="w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
              placeholder="Tell shoppers what makes it special…"
            />
          </Field>

          <div className="grid gap-5 sm:grid-cols-3">
            <Field label="Price (₹)" error={errors.price_rupees?.message}>
              <Input type="number" step="0.01" min="0" {...register("price_rupees")} />
            </Field>
            <Field label="Stock" error={errors.stock?.message}>
              <Input type="number" min="0" {...register("stock")} />
            </Field>
            <Field label="Category" error={errors.category?.message}>
              <Input {...register("category")} placeholder="Home" />
            </Field>
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" {...register("is_active")} className="size-4" />
            Active — visible and purchasable in the shop
          </label>
        </Card>

        <div className="mt-5 flex items-center gap-3">
          <Button type="submit" disabled={saving || uploading}>
            {saving && <Loader2 className="size-4 animate-spin" />}
            {isEdit ? "Save changes" : "List product"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => router.push(ROUTES.shopProducts)}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
