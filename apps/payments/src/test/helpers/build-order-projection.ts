import mongoose from 'mongoose';

import type { OrderStatus } from '@org/contracts';
import { OrderStatuses } from '@org/contracts';

import { Order } from '../../models/order';

export async function buildOrderProjection(
  attrs?: Partial<{
    id: string;
    userId: string;
    status: OrderStatus;
    price: number;
    version: number;
  }>,
) {
  const id = attrs?.id ?? new mongoose.Types.ObjectId().toHexString();

  const order = Order.build({
    id,
    userId: attrs?.userId ?? 'user-1',
    status: attrs?.status ?? OrderStatuses.AwaitingPayment,
    price: attrs?.price ?? 10,
    version: attrs?.version ?? 0,
  });

  await order.save();
  return order;
}
