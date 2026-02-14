import mongoose from 'mongoose';

import type { OrderDoc } from '../../models/order';
import { Payment } from '../../models/payment';
import { type PaymentStatus, PaymentStatuses } from '../../types';

export async function buildPayment(attrs: {
  order: OrderDoc;
  userId?: string;
  amount?: number;
  currency?: string;
  provider?: 'stripe';
  providerId?: string;
  status?: PaymentStatus;
}) {
  const payment = Payment.build({
    order: attrs.order,
    userId: attrs.userId ?? attrs.order.userId,
    amount: attrs.amount ?? Math.round(attrs.order.price * 100),
    currency: attrs.currency ?? 'usd',
    provider: attrs.provider ?? 'stripe',
    providerId: attrs.providerId ?? `ch_test_${new mongoose.Types.ObjectId().toHexString()}`,
    status: attrs.status ?? PaymentStatuses.Succeeded,
  });

  await payment.save();
  return payment;
}
