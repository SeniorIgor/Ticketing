import { makeSafeRequest } from '@/http';

export type CreatePaymentIntentResponse = {
  provider: 'stripe';
  providerId: string; // pi_...
  clientSecret: string;
  status: string;
};

export async function createPaymentIntent(orderId: string) {
  return makeSafeRequest<CreatePaymentIntentResponse, { orderId: string }>('/api/v1/payments/intents', {
    method: 'POST',
    body: { orderId },
  });
}
