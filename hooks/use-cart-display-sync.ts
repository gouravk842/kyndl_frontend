"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useEffectEvent, useRef } from "react";

import { queryKeys } from "@/constants/query-keys";
import { usePresignedAssetRefresh } from "@/hooks/use-presigned-asset-refresh";
import { giftService } from "@/services/gifts/gift.service";
import { useCartStore } from "@/store/cart.store";

/**
 * Backend default for short-lived catalog image signatures
 * (`FILE_DOWNLOAD_URL_EXPIRY_SECONDS`). Cart lines persist `image_url` in
 * localStorage, so without a refresh those MinIO/S3 GETs die after ~30 min.
 */
const CART_IMAGE_URL_EXPIRY_SECONDS = 1800;

/**
 * Keep cart thumbnails (and other display fields) in sync with the live catalog.
 * Mount once near any cart UI (drawer + checkout).
 */
export function useCartDisplaySync() {
  const queryClient = useQueryClient();
  const isHydrated = useCartStore((s) => s.isHydrated);
  const isOpen = useCartStore((s) => s.isOpen);
  const items = useCartStore((s) => s.items);
  const syncFromProducts = useCartStore((s) => s.syncFromProducts);

  const slugs = items.map((i) => i.slug);
  const slugsKey = slugs.slice().sort().join(",");
  const queryKey = [...queryKeys.gifts.all, "cart-display", slugsKey] as const;

  const { data } = useQuery({
    queryKey,
    queryFn: async () => {
      const results = await Promise.all(
        slugs.map((slug) => giftService.product(slug).catch(() => null)),
      );
      return results.filter((p) => p != null);
    },
    enabled: isHydrated && slugs.length > 0,
    staleTime: 60 * 1000,
    refetchOnWindowFocus: true,
  });

  const apply = useEffectEvent(() => {
    if (data?.length) syncFromProducts(data);
  });

  useEffect(() => {
    apply();
  }, [data]);

  // Opening the drawer is a good moment to mint fresh signed image URLs.
  const wasOpen = useRef(false);
  useEffect(() => {
    if (isOpen && !wasOpen.current && slugsKey) {
      void queryClient.invalidateQueries({ queryKey });
    }
    wasOpen.current = isOpen;
    // queryKey is derived from slugsKey; only re-run on open / cart membership.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentionally keyed on slugsKey
  }, [isOpen, slugsKey, queryClient]);

  usePresignedAssetRefresh(
    queryKey,
    CART_IMAGE_URL_EXPIRY_SECONDS,
    isHydrated && slugs.length > 0,
  );
}
