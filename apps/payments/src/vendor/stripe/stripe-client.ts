import Stripe from 'stripe';

import { requireEnv } from '@org/core';

const STRIPE_API_VERSION: Stripe.LatestApiVersion = '2026-01-28.clover';

export function createStripeClient(): Stripe {
  const secretKey = requireEnv('STRIPE_SECRET_KEY');

  return new Stripe(secretKey, {
    apiVersion: STRIPE_API_VERSION,
  });
}

export const stripe = createStripeClient();
