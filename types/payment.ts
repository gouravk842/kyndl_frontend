/**
 * Payment shapes mirrored from the Django `payment` app. Amounts are integers in
 * the smallest currency unit (paise for INR).
 */

/** The product to pay for, as carried by a 402 `payment_required` response. */
export interface PaymentProduct {
  code: string;
  name: string;
  amount: number;
  currency: string;
}

/** Checkout params returned by `POST /payments/create/`. */
export interface CheckoutParams {
  payment_id: string;
  provider: string;
  key_id: string;
  order_id: string;
  amount: number;
  currency: string;
}

/** The fields Razorpay hands back on a successful checkout. */
export interface RazorpaySuccess {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

/** Issued invoice for a captured payment. */
export interface Invoice {
  id: string;
  number: string;
  payment_id: string;
  product_code: string;
  order_id: string | null;
  subtotal: number;
  fees_total: number;
  tax_total: number;
  discount_total: number;
  grand_total: number;
  grand_total_display: string;
  currency: string;
  issued_at: string;
  downloadable: boolean;
  download_reason: string;
}
