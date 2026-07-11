"use client";

import { Heart } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { toast } from "sonner";

import { ROUTES } from "@/constants/routes";
import { useToggleWishlist, useWishlist } from "@/hooks/use-gifts";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth.store";

export function WishlistButton({
  slug,
  className,
  size = "md",
}: {
  slug: string;
  className?: string;
  size?: "sm" | "md";
}) {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const { data: wishlist } = useWishlist();
  const toggle = useToggleWishlist();

  const wishlisted = useMemo(
    () => Boolean(wishlist?.some((w) => w.product.slug === slug)),
    [wishlist, slug],
  );

  const onClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isHydrated && !isAuthenticated) {
      toast("Sign in to save gifts", {
        action: { label: "Log in", onClick: () => router.push(ROUTES.login) },
      });
      return;
    }
    toggle.mutate({ slug, wishlisted });
  };

  const px = size === "sm" ? "size-8" : "size-10";

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={wishlisted ? "Remove from wishlist" : "Save to wishlist"}
      aria-pressed={wishlisted}
      className={cn(
        "inline-flex items-center justify-center rounded-full bg-white/90 text-[#C81D4E] shadow-sm backdrop-blur-sm transition-all hover:scale-105",
        px,
        className,
      )}
    >
      <Heart className={cn("size-[55%]", wishlisted && "fill-current")} />
    </button>
  );
}
