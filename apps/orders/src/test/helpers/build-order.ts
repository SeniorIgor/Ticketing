import type { TicketDoc } from '../../models';
import { Order } from '../../models';
import { OrderStatus } from '../../types';

export async function buildOrder(attrs: {
  userId: string;
  ticket?: TicketDoc;
  status?: (typeof OrderStatus)[keyof typeof OrderStatus];
  expiresAt?: Date;
}) {
  const ticket = attrs.ticket;
  if (!ticket) {
    throw new Error('buildOrder requires ticket');
  }

  const order = Order.build({
    userId: attrs.userId,
    status: attrs.status ?? OrderStatus.Created,
    expiresAt: attrs.expiresAt ?? new Date(Date.now() + 15 * 60 * 1000),
    ticketId: ticket._id,
  });

  await order.save();
  return order;
}
