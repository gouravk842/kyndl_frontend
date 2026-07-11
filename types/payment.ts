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
