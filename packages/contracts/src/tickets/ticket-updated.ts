import { z } from 'zod';

import type { EventDef } from '@org/nats';

export const TicketUpdatedSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  price: z.number().nonnegative(),
  userId: z.string().min(1),
  version: z.number().int().nonnegative(),
});

export type TicketUpdatedData = z.infer<typeof TicketUpdatedSchema>;

export const TicketUpdatedEvent: EventDef<'tickets.updated', TicketUpdatedData> = {
  subject: 'tickets.updated',
  type: 'TicketUpdated',
  version: 1,
  schema: TicketUpdatedSchema,
};
