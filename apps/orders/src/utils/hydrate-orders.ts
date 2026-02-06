import type { OrderDoc } from '../models/order';
import { Ticket } from '../models/ticket';

type TicketResponse = {
  id: string;
  title: string;
  price: number;
};

export type OrderResponse = {
  id: string;
  status: string;
  expiresAt: string | Date;
  ticket: TicketResponse | null;
};

export async function hydrateOrders(orders: OrderDoc[]): Promise<OrderResponse[]> {
  const ticketIds = [...new Set(orders.map((order) => order.ticketId))];

  const tickets = await Ticket.find({ _id: { $in: ticketIds } })
    .select('_id title price')
    .lean();

  const byId = new Map(tickets.map(({ _id, title, price }) => [_id, { id: _id, title, price }]));

  return orders.map(({ id, status, expiresAt, ticketId }) => ({
    id,
    status,
    expiresAt,
    ticket: byId.get(ticketId) ?? null,
  }));
}

export async function hydrateOrder(order: OrderDoc): Promise<OrderResponse> {
  const ticket = await Ticket.findById(order.ticketId).select('_id title price').lean();

  return {
    id: order.id,
    status: order.status,
    expiresAt: order.expiresAt,
    ticket: ticket ? { id: ticket._id, title: ticket.title, price: ticket.price } : null,
  };
}
