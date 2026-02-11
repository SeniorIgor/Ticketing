import { z } from 'zod';

export const ExpirationJobName = {
  ExpireOrder: 'expire-order',
} as const;

export type ExpirationJobName = (typeof ExpirationJobName)[keyof typeof ExpirationJobName];

export const ExpireOrderJob = z.object({
  orderId: z.string().min(1),
  correlationId: z.string().optional(),
});

export type ExpireOrderJobData = z.infer<typeof ExpireOrderJob>;
