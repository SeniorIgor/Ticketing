import type { TicketStatus } from '@org/contracts';
import { TicketStatuses } from '@org/contracts';

import { Ticket } from '../../models/ticket';

export async function buildTicket(
  attrs?: Partial<{ title: string; price: number; userId: string; orderId?: string; status?: TicketStatus }>,
) {
  const ticket = Ticket.build({
    title: attrs?.title ?? 'Concert',
    price: attrs?.price ?? 50,
    userId: attrs?.userId ?? 'user-1',
  });

  if (attrs?.status) {
    ticket.status = attrs.status;
  }
  if (attrs?.orderId !== undefined) {
    ticket.orderId = attrs.orderId;
  }

  // If orderId provided but no status explicitly, make it consistent:
  if (attrs?.orderId && !attrs?.status) {
    ticket.status = TicketStatuses.Reserved;
  }

  await ticket.save();
  return ticket;
}
