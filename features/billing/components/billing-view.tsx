"use client";

import { Download, Loader2, Receipt } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/shared/page-header";
import { useInvoices } from "@/hooks/use-invoices";
import { formatPrice } from "@/lib/gifts";
import { cn } from "@/lib/utils";
import { paymentService } from "@/services/payments/payment.service";

export function BillingView() {
  const { data: invoices, isLoading, isError } = useInvoices();
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  async function handleDownload(id: string, number: string) {
    setDownloadingId(id);
    try {
      await paymentService.downloadInvoicePdf(id, `${number}.pdf`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Download failed.");
    } finally {
      setDownloadingId(null);
    }
  }

  return (
    <>
      <PageHeader
        compact
        eyebrow="Receipts"
        title="Billing"
        subtitle="Invoices for every purchase on Kyndl."
      />

      <PageContainer size="lg" className="py-10 md:py-14">
        {isLoading ? (
          <div className="flex justify-center py-20 text-[#C75B39]">
            <Loader2 className="size-6 animate-spin" />
          </div>
        ) : isError ? (
          <p className="py-20 text-center text-[#7A6258]">
            We couldn&apos;t load your invoices. Please refresh.
          </p>
        ) : !invoices || invoices.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-[#F2DACE] bg-white/60 py-20 text-center">
            <Receipt className="mx-auto size-10 text-[#E3A78C]" />
            <p className="mt-4 font-display text-xl text-[#3A2A25]">
              No invoices yet
            </p>
            <p className="mt-2 text-sm text-[#7A6258]">
              They appear here after a successful payment.
            </p>
          </div>
        ) : (
          <ul className="flex flex-col gap-3">
            {invoices.map((invoice) => {
              const busy = downloadingId === invoice.id;
              return (
                <li
                  key={invoice.id}
                  className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-[#F4DDD0] bg-white px-5 py-4 md:px-6"
                >
                  <div>
                    <p className="text-sm font-medium text-[#3A2A25]">
                      {invoice.number}
                    </p>
                    <p className="mt-0.5 text-xs text-[#B08C7D]">
                      {invoice.product_code}
                      {invoice.order_id
                        ? ` · order #${invoice.order_id.slice(0, 8)}`
                        : ""}
                      {" · "}
                      {new Date(invoice.issued_at).toLocaleDateString(
                        undefined,
                        {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        },
                      )}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-display text-lg text-[#3A2A25]">
                      {formatPrice(invoice.grand_total, invoice.currency)}
                    </span>
                    <button
                      type="button"
                      disabled={!invoice.downloadable || busy}
                      onClick={() => handleDownload(invoice.id, invoice.number)}
                      title={
                        invoice.downloadable
                          ? "Download PDF"
                          : invoice.download_reason === "order_not_delivered"
                            ? "Available once the gift is delivered"
                            : "Not available yet"
                      }
                      className={cn(
                        "inline-flex h-10 items-center gap-2 rounded-full px-4 text-sm font-medium transition",
                        invoice.downloadable
                          ? "bg-gradient-to-r from-[#FF7A59] to-[#F2596F] text-white"
                          : "cursor-not-allowed bg-[#F4DDD0] text-[#B08C7D]",
                      )}
                    >
                      {busy ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <Download className="size-4" />
                      )}
                      PDF
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </PageContainer>
    </>
  );
}
