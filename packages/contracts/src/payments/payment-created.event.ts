import { z } from 'zod';

import { defineEvent, Subjects } from '@org/nats';

export const PaymentCreatedSchema = z.object({
  id: z.string().min(1), // paymentId
  orderId: z.string().min(1),
  stripeId: z.string().min(1), // or provider txn id
});

export type PaymentCreatedData = z.infer<typeof PaymentCreatedSchema>;

export const PaymentCreatedEvent = defineEvent({
  subject: Subjects.PaymentCreated,
  type: 'PaymentCreated',
  version: 1,
  schema: PaymentCreatedSchema,
});
