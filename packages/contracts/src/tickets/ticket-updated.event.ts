import { z } from 'zod';

import { defineEvent, Subjects } from '@org/nats';

export const TicketUpdatedSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  price: z.number().nonnegative(),
  userId: z.string().min(1),
  version: z.number().int().nonnegative(),
  // reservation state (optional)
  orderId: z.string().min(1).optional(),
});

export type TicketUpdatedData = z.infer<typeof TicketUpdatedSchema>;

export const TicketUpdatedEvent = defineEvent({
  subject: Subjects.TicketUpdated,
  type: 'TicketUpdated',
  version: 1,
  schema: TicketUpdatedSchema,
});
