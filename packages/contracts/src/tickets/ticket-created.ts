import { z } from 'zod';

import { defineEventFamily } from '@org/nats';

import { TicketSubjects } from './subjects';

const V1 = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  price: z.number().nonnegative(),
  userId: z.string().min(1),
  version: z.number().int().nonnegative(),
});

const V2 = V1.extend({
  // example evolution: add currency with default
  currency: z.string().min(1).default('USD'),
});

export const TicketCreatedEvent = defineEventFamily({
  subject: TicketSubjects.TicketCreated,
  type: 'TicketCreated',
  schemaByVersion: {
    1: V1,
    2: V2,
  },
  latestVersion: 2,
});

export type TicketCreatedV1 = z.infer<typeof V1>;
export type TicketCreatedV2 = z.infer<typeof V2>;
