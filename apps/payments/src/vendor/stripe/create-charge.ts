import { createStripeClient } from './stripe-client';
import type { ChargeParams, ChargeResult, ChargeStatus } from './types';

const stripe = createStripeClient();

/**
 * Creates and confirms a Stripe PaymentIntent.
 *
 * Documentation:
 * Read more: https://docs.stripe.com/testing
 */
export async function createCharge({
  amount,
  currency,
  idempotencyKey,
  paymentMethodId,
  description,
  metadata,
}: ChargeParams): Promise<ChargeResult> {
  const intent = await stripe.paymentIntents.create(
    {
      amount,
      currency,
      description,
      metadata,

      payment_method: paymentMethodId,
      confirm: true,

      // Prevent redirect-based methods => no return_url needed
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: 'never',
      },
    },
    { idempotencyKey },
  );

  return {
    id: intent.id,
    status: intent.status as ChargeStatus,
    clientSecret: intent.client_secret ?? undefined,
  };
}
