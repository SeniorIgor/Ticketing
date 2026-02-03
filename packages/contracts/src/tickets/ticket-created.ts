import { z } from 'zod';

import { defineEvent } from '@org/nats';

import { TicketSubjects } from './subjects';

export const TicketCreatedSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  price: z.number().nonnegative(),
  userId: z.string().min(1),
  version: z.number().int().nonnegative(),
});
export type TicketCreatedData = z.infer<typeof TicketCreatedSchema>;

export const TicketCreatedEvent = defineEvent({
  subject: TicketSubjects.TicketCreated,
  type: 'TicketCreated',
  version: 1,
  schema: TicketCreatedSchema,
});
