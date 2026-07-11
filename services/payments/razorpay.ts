import type { CheckoutParams, RazorpaySuccess } from "@/types/payment";

const SDK_SRC = "https://checkout.razorpay.com/v1/checkout.js";

interface RazorpayHandlerResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

interface RazorpayInstance {
  open: () => void;
}

// Minimal shape of the global the SDK installs on `window`.
type RazorpayConstructor = new (options: Record<string, unknown>) => RazorpayInstance;

declare global {
  interface Window {
    Razorpay?: RazorpayConstructor;
  }
}

let sdkPromise: Promise<void> | null = null;

/** Load the Razorpay checkout SDK once, lazily (browser-only). */
function loadSdk(): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Razorpay is only available in the browser."));
  }
  if (window.Razorpay) return Promise.resolve();
  if (sdkPromise) return sdkPromise;

  sdkPromise = new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = SDK_SRC;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      sdkPromise = null;
      reject(new Error("Could not load the payment SDK."));
    };
    document.body.appendChild(script);
  });
  return sdkPromise;
}

export interface CheckoutOptions {
  checkout: CheckoutParams;
  /** Shown in the checkout modal. */
  name: string;
  description?: string;
  prefill?: { name?: string; email?: string };
}

/**
 * Open Razorpay checkout for the given order. Resolves with the success payload
 * to verify server-side, or `null` if the user dismisses the modal.
 */
export async function openRazorpayCheckout(
  options: CheckoutOptions,
): Promise<RazorpaySuccess | null> {
  await loadSdk();
  const Razorpay = window.Razorpay;
  if (!Razorpay) throw new Error("Payment SDK unavailable.");

  const { checkout, name, description, prefill } = options;

  return new Promise<RazorpaySuccess | null>((resolve, reject) => {
    let settled = false;
    const instance = new Razorpay({
      key: checkout.key_id,
      order_id: checkout.order_id,
      amount: checkout.amount,
      currency: checkout.currency,
      name,
      description,
      prefill,
      handler: (response: RazorpayHandlerResponse) => {
        settled = true;
        resolve({
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature,
        });
      },
      modal: {
        ondismiss: () => {
          if (!settled) resolve(null);
        },
      },
    });
    try {
      instance.open();
    } catch (err) {
      reject(err instanceof Error ? err : new Error("Could not open checkout."));
    }
  });
}
