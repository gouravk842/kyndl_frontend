import { apiRequest } from "@/services/api/client";
import type { CheckoutParams, Invoice, RazorpaySuccess } from "@/types/payment";

// Hits the same-origin Next BFF, which forwards to Django with the httpOnly
// access cookie as a bearer token.
const BASE = "/payments";

export interface CreatePaymentPayload {
  product_code: string;
  /** The caller's own object this payment is for — e.g. a creation id. */
  reference_id?: string;
  metadata?: Record<string, unknown>;
  idempotency_key?: string;
}

export const paymentService = {
  // Open a payment and get back provider checkout params (Razorpay order, key).
  create(payload: CreatePaymentPayload) {
    return apiRequest<CheckoutParams>({
      method: "POST",
      url: `${BASE}/create`,
      data: payload,
    });
  },

  // Verify a successful checkout and capture the payment.
  verify(payload: RazorpaySuccess) {
    return apiRequest<{ id: string; status: string }>({
      method: "POST",
      url: `${BASE}/verify`,
      data: payload,
    });
  },

  listInvoices() {
    return apiRequest<Invoice[] | { results: Invoice[] }>({
      method: "GET",
      url: `${BASE}/invoices`,
    }).then((data) => (Array.isArray(data) ? data : (data.results ?? [])));
  },

  async downloadInvoicePdf(invoiceId: string, filename?: string) {
    const res = await fetch(`/api/payments/invoices/${invoiceId}/pdf`, {
      method: "GET",
      credentials: "include",
    });
    if (!res.ok) {
      let detail = "Could not download invoice.";
      try {
        const body = (await res.json()) as { detail?: string };
        if (body.detail) detail = body.detail;
      } catch {
        // keep default
      }
      throw new Error(detail);
    }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename || `invoice-${invoiceId}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  },
};
