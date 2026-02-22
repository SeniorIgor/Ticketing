export interface ChargeParams {
  /**
   * Stripe PaymentMethod ID.
   *
   * In TEST mode you can use:
   * - "pm_card_visa" (success)
   *
   * In production, create this on the frontend via Stripe.js (PaymentElement / card element),
   * then send the resulting PaymentMethod id ("pm_...") to the backend.
   */
  paymentMethodId: string;

  /**
   * Amount in the smallest currency unit (USD => cents).
   * Example: $30.00 => 3000
   */
  amount: number;

  /** ISO currency code (e.g. "usd") */
  currency: string;

  /** Idempotency key. Use orderId to avoid duplicate charges. */
  idempotencyKey: string;

  description?: string;
  metadata?: Record<string, string>;
}

export type ChargeStatus = 'succeeded' | 'requires_action' | 'requires_payment_method' | 'processing' | 'canceled';

export interface ChargeResult {
  /** Stripe PaymentIntent id (pi_...) */
  id: string;

  /** PaymentIntent status */
  status: ChargeStatus;

  /**
   * Present for statuses that may require client-side handling.
   * (You can ignore for your “success-only” flow, but returning it is future-proof.)
   */
  clientSecret?: string;
}
