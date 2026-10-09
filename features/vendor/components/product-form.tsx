"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ImagePlus, Loader2, Star, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ROUTES } from "@/constants/routes";
import { useCategories } from "@/hooks/use-gifts";
import {
  useCreateVendorProduct,
  useUpdateVendorProduct,
} from "@/hooks/use-vendor";
import { cn } from "@/lib/utils";
import { fileService } from "@/services/files/file.service";
import type { VendorProduct, VendorProductInput } from "@/types/vendor";

const MAX_PRODUCT_IMAGES = 5;

const schema = z.object({
  name: z.string().min(2, "Give your product a name."),
  tagline: z.string().max(200).optional(),
  description: z.string().max(4000).optional(),
  price_rupees: z.coerce.number().positive("Enter a price above zero."),
  stock: z.coerce.number().int().min(0, "Stock can't be negative."),
  category: z.string().max(60).optional(),
  subcategory: z.string().max(60).optional(),
  is_active: z.boolean(),
});

type FormValues = z.input<typeof schema>;

type LocalImage = {
  fileId: string;
  preview: string;
};

export function ProductForm({ existing }: { existing?: VendorProduct }) {
  const router = useRouter();
  const isEdit = Boolean(existing);
  const create = useCreateVendorProduct();
  const update = useUpdateVendorProduct(existing?.slug ?? "");

  const [images, setImages] = useState<LocalImage[]>(() => {
    if (!existing?.images?.length) {
      if (existing?.image_file_ids?.length) {
        return existing.image_file_ids.map((fileId, i) => ({
          fileId,
          preview: existing.gallery?.[i] || existing.image_url || "",
        }));
      }
      return [];
    }
    return existing.images.map((img) => ({
      fileId: img.file_id,
      preview: img.thumb_url || img.url || "",
    }));
  });
  const [thumbnailFileId, setThumbnailFileId] = useState<string | null>(
    existing?.thumbnail_file_id ??
      existing?.images?.find((i) => i.is_thumbnail)?.file_id ??
      existing?.images?.[0]?.file_id ??
      null,
  );
  const [uploading, setUploading] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);

  const { data: categories } = useCategories();

  const {
    register,
    handleSubmit,
    control,
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
      subcategory: existing?.subcategory ?? "",
      is_active: existing?.is_active ?? true,
    },
  });

  // Suggest subcategories for the master the vendor has picked/typed. A brand-new
  // category simply has no suggestions yet — they can still type one freely.
  const categoryValue = (useWatch({ control, name: "category" }) ?? "")
    .trim()
    .toLowerCase();
  const activeMaster = categories?.find(
    (c) => c.name.toLowerCase() === categoryValue,
  );
  const subOptions = activeMaster?.subcategories ?? [];

  const onPickImages = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (!files.length) return;

    const room = MAX_PRODUCT_IMAGES - images.length;
    if (room <= 0) {
      toast.error(`You can add up to ${MAX_PRODUCT_IMAGES} images.`);
      return;
    }
    const batch = files.slice(0, room);
    if (files.length > room) {
      toast.message(
        `Only ${room} more image${room === 1 ? "" : "s"} can be added.`,
      );
    }

    setUploading(true);
    setImageError(null);
    try {
      const uploaded: LocalImage[] = [];
      for (const file of batch) {
        const fileId = await fileService.upload(file, "gift-product");
        uploaded.push({ fileId, preview: URL.createObjectURL(file) });
      }
      setImages((prev) => [...prev, ...uploaded]);
      setThumbnailFileId((prev) => prev ?? uploaded[0]?.fileId ?? null);
    } catch {
      toast.error("Could not upload that image. Please try another.");
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (fileId: string) => {
    setImages((prev) => {
      const next = prev.filter((img) => img.fileId !== fileId);
      if (thumbnailFileId === fileId) {
        setThumbnailFileId(next[0]?.fileId ?? null);
      }
      return next;
    });
  };

  const onSubmit = (values: FormValues) => {
    if (!images.length) {
      setImageError("Add at least one product image.");
      return;
    }
    if (
      !thumbnailFileId ||
      !images.some((img) => img.fileId === thumbnailFileId)
    ) {
      setImageError("Choose which image is the thumbnail.");
      return;
    }
    setImageError(null);

    const parsed = schema.parse(values);
    const payload: VendorProductInput = {
      name: parsed.name,
      tagline: parsed.tagline,
      description: parsed.description,
      price: Math.round(parsed.price_rupees * 100),
      stock: parsed.stock,
      category: parsed.category,
      subcategory: parsed.subcategory,
      is_active: parsed.is_active,
      image_file_ids: images.map((img) => img.fileId),
      thumbnail_file_id: thumbnailFileId,
    };

    if (isEdit && existing) {
      update.mutate(payload, {
        onSuccess: () => router.push(ROUTES.shopProducts),
      });
    } else {
      create.mutate(payload, {
        onSuccess: () => router.push(ROUTES.shopProducts),
      });
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
          {isEdit
            ? "Update the details shoppers see."
            : "List a new gift in your shop."}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card className="space-y-5 p-6">
          <div className="space-y-3">
            <div>
              <Label>Product images</Label>
              <p className="mt-1 text-xs text-muted-foreground">
                Up to {MAX_PRODUCT_IMAGES}. Tap a star to choose the thumbnail
                used on cards and in the shop.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              {images.map((img) => {
                const isThumb = img.fileId === thumbnailFileId;
                return (
                  <div
                    key={img.fileId}
                    className={cn(
                      "relative size-24 overflow-hidden rounded-xl border bg-muted",
                      isThumb && "ring-2 ring-primary ring-offset-2",
                    )}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img.preview}
                      alt=""
                      className="size-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setThumbnailFileId(img.fileId)}
                      className={cn(
                        "absolute left-1 top-1 inline-flex size-7 items-center justify-center rounded-full",
                        "bg-black/55 text-white backdrop-blur-sm transition-colors",
                        isThumb ? "text-amber-300" : "hover:text-amber-200",
                      )}
                      title={isThumb ? "Thumbnail" : "Use as thumbnail"}
                      aria-label={
                        isThumb ? "Current thumbnail" : "Use as thumbnail"
                      }
                    >
                      <Star
                        className={cn("size-3.5", isThumb && "fill-current")}
                      />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeImage(img.fileId)}
                      className="absolute right-1 top-1 inline-flex size-7 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur-sm hover:bg-black/70"
                      aria-label="Remove image"
                    >
                      <X className="size-3.5" />
                    </button>
                    {isThumb && (
                      <span className="absolute inset-x-0 bottom-0 bg-black/55 py-0.5 text-center text-[10px] font-medium tracking-wide text-white uppercase">
                        Thumb
                      </span>
                    )}
                  </div>
                );
              })}

              {images.length < MAX_PRODUCT_IMAGES && (
                <label
                  className={cn(
                    "flex size-24 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border border-dashed",
                    "text-muted-foreground hover:bg-accent",
                    uploading && "pointer-events-none opacity-60",
                  )}
                >
                  {uploading ? (
                    <Loader2 className="size-5 animate-spin" />
                  ) : (
                    <ImagePlus className="size-5" />
                  )}
                  <span className="text-[10px] font-medium tracking-wide uppercase">
                    {uploading ? "…" : "Add"}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={onPickImages}
                  />
                </label>
              )}
            </div>
            {imageError && (
              <p className="text-sm text-destructive">{imageError}</p>
            )}
          </div>

          <Field label="Name" error={errors.name?.message}>
            <Input {...register("name")} placeholder="Cozy soy candle" />
          </Field>
          <Field label="Tagline" error={errors.tagline?.message}>
            <Input
              {...register("tagline")}
              placeholder="A warm little glow for cold evenings"
            />
          </Field>
          <Field label="Description" error={errors.description?.message}>
            <textarea
              {...register("description")}
              rows={4}
              className="w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
              placeholder="Tell shoppers what makes it special…"
            />
          </Field>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Price (₹)" error={errors.price_rupees?.message}>
              <Input
                type="number"
                step="0.01"
                min="0"
                {...register("price_rupees")}
              />
            </Field>
            <Field label="Stock" error={errors.stock?.message}>
              <Input type="number" min="0" {...register("stock")} />
            </Field>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Category" error={errors.category?.message}>
              <Input
                {...register("category")}
                list="category-options"
                placeholder="Home"
                autoComplete="off"
              />
              <datalist id="category-options">
                {categories?.map((c) => (
                  <option key={c.slug} value={c.name} />
                ))}
              </datalist>
              <p className="text-xs text-muted-foreground">
                Pick an existing one or type a new — it’s added to the shop’s
                list.
              </p>
            </Field>
            <Field label="Subcategory" error={errors.subcategory?.message}>
              <Input
                {...register("subcategory")}
                list="subcategory-options"
                placeholder="Candles"
                autoComplete="off"
              />
              <datalist id="subcategory-options">
                {subOptions.map((s) => (
                  <option key={s.slug} value={s.name} />
                ))}
              </datalist>
              <p className="text-xs text-muted-foreground">
                Optional — groups this within the category.
              </p>
            </Field>
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              {...register("is_active")}
              className="size-4"
            />
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
