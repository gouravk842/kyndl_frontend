"use client";

import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ROUTES } from "@/constants/routes";
import { formatPrice } from "@/lib/gifts";
import { cn } from "@/lib/utils";
import { cartCount, cartSubtotal, useCartStore } from "@/store/cart.store";

export function CartButton() {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const isOpen = useCartStore((s) => s.isOpen);
  const isHydrated = useCartStore((s) => s.isHydrated);
  const setOpen = useCartStore((s) => s.setOpen);
  const setQuantity = useCartStore((s) => s.setQuantity);
  const remove = useCartStore((s) => s.remove);

  const count = isHydrated ? cartCount(items) : 0;
  const subtotal = cartSubtotal(items);

  const goToCheckout = () => {
    setOpen(false);
    router.push(ROUTES.checkout);
  };

  return (
    <Sheet open={isOpen} onOpenChange={setOpen}>
      <SheetTrigger
        aria-label="Open cart"
        className="relative inline-flex size-10 items-center justify-center rounded-full text-[#7A6258] transition-colors hover:bg-white/70 hover:text-[#3A2A25]"
      >
        <ShoppingBag className="size-5" />
        {count > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex min-w-5 items-center justify-center rounded-full bg-gradient-to-r from-[#FF7A59] to-[#F2596F] px-1 text-[11px] font-bold text-white">
            {count}
          </span>
        )}
      </SheetTrigger>

      <SheetContent side="right" className="w-full gap-0 bg-[#FFF7F1] sm:max-w-md">
        <SheetHeader className="border-b border-[#F4DDD0] px-5 py-4">
          <SheetTitle className="font-display text-xl text-[#3A2A25]">
            Your gift bag
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
            <ShoppingBag className="size-10 text-[#E3A78C]" />
            <p className="font-display text-lg text-[#3A2A25]">Nothing in here yet</p>
            <p className="text-sm text-[#7A6258]">
              Find a little something worth unwrapping.
            </p>
            <Link
              href={ROUTES.gifts}
              onClick={() => setOpen(false)}
              className="mt-2 inline-flex h-10 items-center rounded-full bg-gradient-to-r from-[#FF7A59] to-[#F2596F] px-5 text-sm font-medium text-white kyndl-glow-warm"
            >
              Browse gifts
            </Link>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-5 py-4">
              <ul className="flex flex-col gap-4">
                {items.map((item) => (
                  <li key={item.slug} className="flex gap-3">
                    <span className="size-16 shrink-0 overflow-hidden rounded-xl bg-[#FDEBE6]">
                      {item.image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.image_url}
                          alt={item.name}
                          className="size-full object-cover"
                        />
                      ) : null}
                    </span>
                    <div className="flex flex-1 flex-col">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium text-[#3A2A25]">{item.name}</p>
                        <button
                          type="button"
                          onClick={() => remove(item.slug)}
                          aria-label={`Remove ${item.name}`}
                          className="text-[#B08C7D] transition-colors hover:text-[#C81D4E]"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                      <p className="text-sm text-[#7A6258]">
                        {formatPrice(item.price, item.currency)}
                      </p>
                      <div className="mt-2 flex items-center justify-between">
                        <div className="inline-flex items-center rounded-full border border-[#F2DACE] bg-white">
                          <button
                            type="button"
                            onClick={() => setQuantity(item.slug, item.quantity - 1)}
                            aria-label="Decrease quantity"
                            className="flex size-8 items-center justify-center rounded-full text-[#7A6258] hover:text-[#3A2A25]"
                          >
                            <Minus className="size-3.5" />
                          </button>
                          <span className="w-6 text-center text-sm text-[#3A2A25]">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => setQuantity(item.slug, item.quantity + 1)}
                            disabled={item.quantity >= Math.max(item.maxStock, 1)}
                            aria-label="Increase quantity"
                            className="flex size-8 items-center justify-center rounded-full text-[#7A6258] hover:text-[#3A2A25] disabled:opacity-30"
                          >
                            <Plus className="size-3.5" />
                          </button>
                        </div>
                        <span className="text-sm font-medium text-[#3A2A25]">
                          {formatPrice(item.price * item.quantity, item.currency)}
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="border-t border-[#F4DDD0] px-5 py-4">
              <div className="flex items-center justify-between text-sm text-[#7A6258]">
                <span>Subtotal</span>
                <span className="font-display text-lg text-[#3A2A25]">
                  {formatPrice(subtotal)}
                </span>
              </div>
              <p className="mt-1 text-xs text-[#B08C7D]">
                Shipping calculated at checkout · free over ₹999.
              </p>
              <button
                type="button"
                onClick={goToCheckout}
                className={cn(
                  "mt-4 flex h-12 w-full items-center justify-center rounded-full text-base font-medium text-white",
                  "bg-gradient-to-r from-[#FF7A59] to-[#F2596F] kyndl-glow-warm transition-all duration-300 hover:-translate-y-0.5",
                )}
              >
                Checkout
              </button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
