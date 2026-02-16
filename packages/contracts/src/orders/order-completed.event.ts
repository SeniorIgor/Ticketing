import { z } from 'zod';

import { defineEvent, Subjects } from '@org/nats';

export const OrderCompletedSchema = z.object({
  id: z.string().min(1), // orderId
  userId: z.string().min(1),
  version: z.number().int().nonnegative(),
  ticket: z.object({ id: z.string().min(1) }),
});

export type OrderCompletedData = z.infer<typeof OrderCompletedSchema>;

export const OrderCompletedEvent = defineEvent({
  subject: Subjects.OrderCompleted,
  type: 'OrderCompleted',
  version: 1,
  schema: OrderCompletedSchema,
});
