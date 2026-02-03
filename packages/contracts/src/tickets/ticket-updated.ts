import { z } from 'zod';

import { defineEvent } from '@org/nats';

import { TicketSubjects } from './subjects';

export const TicketUpdatedSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  price: z.number().nonnegative(),
  userId: z.string().min(1),
  version: z.number().int().nonnegative(),
});

export type TicketUpdatedData = z.infer<typeof TicketUpdatedSchema>;

export const TicketUpdatedEvent = defineEvent({
  subject: TicketSubjects.TicketUpdated,
  type: 'TicketUpdated',
  version: 1,
  schema: TicketUpdatedSchema,
});
