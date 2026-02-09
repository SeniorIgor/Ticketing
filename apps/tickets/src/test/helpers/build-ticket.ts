import { Ticket } from '../../models';

export async function buildTicket(attrs?: Partial<{ title: string; price: number; userId: string; orderId?: string }>) {
  const ticket = Ticket.build({
    title: attrs?.title ?? 'Concert',
    price: attrs?.price ?? 50,
    userId: attrs?.userId ?? 'user-1',
  });

  if (attrs?.orderId !== undefined) {
    ticket.orderId = attrs.orderId;
  }

  await ticket.save();
  return ticket;
}
