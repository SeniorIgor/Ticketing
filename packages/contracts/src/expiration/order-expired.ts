import { z } from 'zod';

import { defineEvent, Subjects } from '@org/nats';

export const OrderExpiredSchema = z.object({
  orderId: z.string().min(1),
});

export type OrderExpiredData = z.infer<typeof OrderExpiredSchema>;

export const OrderExpiredEvent = defineEvent({
  subject: Subjects.OrderExpired,
  type: 'OrderExpired',
  version: 1,
  schema: OrderExpiredSchema,
});
