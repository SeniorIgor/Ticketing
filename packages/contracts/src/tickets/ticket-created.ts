import { z } from 'zod';

import type { EventDef } from '@org/nats';

import { TicketSubjects } from './subjects';

export const TicketCreatedSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  price: z.number().nonnegative(),
  userId: z.string().min(1),
  version: z.number().int().nonnegative(),
});
export type TicketCreatedData = z.infer<typeof TicketCreatedSchema>;

export const TicketCreatedEvent: EventDef<typeof TicketSubjects.TicketCreated, TicketCreatedData> = {
  subject: TicketSubjects.TicketCreated,
  type: 'TicketCreated',
  version: 1,
  schema: TicketCreatedSchema,
};
