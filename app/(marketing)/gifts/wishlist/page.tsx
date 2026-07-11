import { ROUTES } from "@/constants/routes";
import { WishlistView } from "@/features/gifts/components/wishlist-view";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Wishlist",
  description: "Gifts you've saved for later.",
  path: ROUTES.giftWishlist,
  noIndex: true,
});

export default function WishlistPage() {
  return <WishlistView />;
}
