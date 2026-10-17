"use client";

import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { CalmPopup } from "@/components/ui/calm-popup";
import { usePurchaseQuotaPack } from "@/hooks/use-quota";
import { formatPackPrice } from "@/lib/quota";
import type { QuotaFeature, QuotaPack, QuotaStatus } from "@/types/quota";

export function QuotaPackDialog({
  open,
  feature,
  status,
  onClose,
  onPurchased,
}: {
  open: boolean;
  feature: QuotaFeature;
  status: QuotaStatus | null;
  onClose: () => void;
  /** Called after a successful pack purchase so the caller can retry create. */
  onPurchased: () => void | Promise<void>;
}) {
  const purchase = usePurchaseQuotaPack(feature);
  const packs = status?.packs ?? [];
  const used = status?.used ?? 0;
  const limit = status?.limit;

  async function buy(pack: QuotaPack) {
    try {
      await purchase.mutateAsync(pack);
      await onPurchased();
      onClose();
    } catch {
      // Hook toasts; keep dialog open so they can try another pack.
    }
  }

  return (
    <CalmPopup
      open={open}
      onClose={onClose}
      labelledBy="quota-pack-title"
      className="border-[#eadfd4] bg-[#fbf7f2] dark:border-white/10 dark:bg-[#221c1a]"
    >
      <div className="flex max-h-[90dvh] flex-col gap-4 p-5 sm:p-6">
        <div>
          <h2
            id="quota-pack-title"
            className="font-display text-xl text-[#2c2420] dark:text-[#f6efe9]"
          >
            You&apos;ve used your free space
          </h2>
          <p className="mt-1.5 text-sm text-[#6b5c54] dark:text-white/60">
            {limit != null
              ? `${used} of ${limit} used. Pick a pack to keep more — one payment, forever yours.`
              : "Pick a pack to keep more — one payment, forever yours."}
          </p>
        </div>

        {packs.length === 0 ? (
          <p className="text-sm text-[#6b5c54] dark:text-white/60">
            No packs are available right now. Try again later.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {packs.map((pack) => (
              <li key={pack.code}>
                <button
                  type="button"
                  disabled={purchase.isPending}
                  onClick={() => buy(pack)}
                  className="flex w-full items-center justify-between gap-3 rounded-2xl border border-[#eadfd4] bg-white px-4 py-3.5 text-left transition hover:border-[#f2596f]/50 hover:bg-[#fff8f5] disabled:opacity-60 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
                >
                  <span>
                    <span className="block text-sm font-medium text-[#2c2420] dark:text-[#f6efe9]">
                      {pack.name}
                    </span>
                    <span className="mt-0.5 block text-xs text-[#6b5c54] dark:text-white/50">
                      +{pack.units} more
                    </span>
                  </span>
                  <span className="shrink-0 text-sm font-semibold tabular-nums text-[#c2415a]">
                    {purchase.isPending ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      formatPackPrice(pack.amount, pack.currency)
                    )}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}

        <Button
          type="button"
          variant="ghost"
          className="self-start"
          onClick={onClose}
          disabled={purchase.isPending}
        >
          Not now
        </Button>
      </div>
    </CalmPopup>
  );
}
