import type Stripe from 'stripe';

import { stripe } from './stripe-client';

export type GetPaymentIntentResult = Pick<Stripe.PaymentIntent, 'id' | 'status' | 'amount' | 'currency' | 'metadata'>;

export async function getPaymentIntent(paymentIntentId: string): Promise<GetPaymentIntentResult> {
  const intent = await stripe.paymentIntents.retrieve(paymentIntentId);

  return {
    id: intent.id,
    status: intent.status,
    amount: intent.amount,
    currency: intent.currency,
    metadata: intent.metadata ?? {},
  };
}
