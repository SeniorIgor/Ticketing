import { z } from 'zod';

import { defineEvent, Subjects } from '@org/nats';

export const OrderCancelledSchema = z.object({
  id: z.string().min(1),
  ticket: z.object({
    id: z.string().min(1),
  }),
  userId: z.string().min(1),
  version: z.number().int().nonnegative(),
});

export type OrderCancelledData = z.infer<typeof OrderCancelledSchema>;

export const OrderCancelledEvent = defineEvent({
  subject: Subjects.OrderCancelled,
  type: 'OrderCancelled',
  version: 1,
  schema: OrderCancelledSchema,
});
