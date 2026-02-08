import { z } from 'zod';

import { defineEvent, Subjects } from '@org/nats';

export const OrderCreatedSchema = z.object({
  id: z.string().min(1),
  userId: z.string().min(1),
  status: z.enum(['created', 'awaiting_payment', 'complete', 'cancelled']),
  expiresAt: z.string().min(1), // ISO string
  ticket: z.object({
    id: z.string().min(1),
    price: z.number().nonnegative(),
  }),
  version: z.number().int().nonnegative(),
});

export type OrderCreatedData = z.infer<typeof OrderCreatedSchema>;

export const OrderCreatedEvent = defineEvent({
  subject: Subjects.OrderCreated,
  type: 'OrderCreated',
  version: 1,
  schema: OrderCreatedSchema,
});
