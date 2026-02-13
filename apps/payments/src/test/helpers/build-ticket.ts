import mongoose from 'mongoose';

import { Ticket } from '../../models';

export async function buildTicket(attrs?: Partial<{ id: string; title: string; price: number; version: number }>) {
  const id = attrs?.id ?? new mongoose.Types.ObjectId().toHexString();

  const ticket = Ticket.build({
    id,
    title: attrs?.title ?? 'Concert',
    price: attrs?.price ?? 50,
    version: attrs?.version ?? 0,
  });

  await ticket.save();
  return ticket;
}
