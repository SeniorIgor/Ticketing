import { makeSafeRequest } from '@/http';

export type ConfirmPaymentResponse = {
  id: string;
  orderId: string;
  provider: 'stripe';
  providerId: string;
  status: string;
};

export async function confirmPayment(orderId: string, paymentIntentId: string) {
  return makeSafeRequest<ConfirmPaymentResponse, { orderId: string; paymentIntentId: string }>(
    '/api/v1/payments/confirm',
    {
      method: 'POST',
      body: { orderId, paymentIntentId },
    },
  );
}
