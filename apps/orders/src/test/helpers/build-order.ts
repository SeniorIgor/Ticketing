import { type OrderStatus, OrderStatuses } from '@org/contracts';

import type { TicketDoc } from '../../models';
import { Order } from '../../models';

export async function buildOrder(attrs: {
  userId: string;
  ticket?: TicketDoc;
  status?: OrderStatus;
  expiresAt?: Date;
}) {
  const ticket = attrs.ticket;
  if (!ticket) {
    throw new Error('buildOrder requires ticket');
  }

  const order = Order.build({
    userId: attrs.userId,
    status: attrs.status ?? OrderStatuses.Created,
    expiresAt: attrs.expiresAt ?? new Date(Date.now() + 15 * 60 * 1000),
    ticket,
  });

  await order.save();
  return order;
}
