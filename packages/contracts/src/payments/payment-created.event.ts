import { z } from 'zod';

import { defineEvent, Subjects } from '@org/nats';

import { PaymentProviderValues } from './payment-provider';

export const PaymentCreatedSchema = z.object({
  id: z.string().min(1), // paymentId
  orderId: z.string().min(1),
  provider: z.enum(PaymentProviderValues), // extend later
  providerId: z.string().min(1), // txn id from provider (pi_...)
});

export type PaymentCreatedData = z.infer<typeof PaymentCreatedSchema>;

export const PaymentCreatedEvent = defineEvent({
  subject: Subjects.PaymentCreated,
  type: 'PaymentCreated',
  version: 1,
  schema: PaymentCreatedSchema,
});
