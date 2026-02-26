import type Stripe from 'stripe';

import { stripe } from './stripe-client';

export type CreatePaymentIntentInput = {
  amount: number;
  currency: string;
  idempotencyKey: string;
  description?: string;
  metadata: Record<string, string>;
};

export type CreatePaymentIntentResult = Pick<
  Stripe.PaymentIntent,
  'id' | 'client_secret' | 'status' | 'amount' | 'currency' | 'metadata'
>;

export async function createPaymentIntent(input: CreatePaymentIntentInput): Promise<CreatePaymentIntentResult> {
  const intent = await stripe.paymentIntents.create(
    {
      amount: input.amount,
      currency: input.currency,
      description: input.description,
      metadata: input.metadata,
      automatic_payment_methods: { enabled: true },
    },
    { idempotencyKey: input.idempotencyKey },
  );

  return {
    id: intent.id,
    client_secret: intent.client_secret,
    status: intent.status,
    amount: intent.amount,
    currency: intent.currency,
    metadata: intent.metadata ?? {},
  };
}
