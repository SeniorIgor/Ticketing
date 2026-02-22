import mongoose from 'mongoose';
import { z } from 'zod';

import { PaymentStatuses } from '../types';

const MAX_LIMIT = 100;
const DEFAULT_LIMIT = 20;

const emptyStringToUndefined = z.string().transform((value) => {
  const trimmed = value.trim();
  return trimmed.length === 0 ? undefined : trimmed;
});

const PAYMENT_STATUS_VALUES = Object.values(PaymentStatuses) as readonly string[];

export const GetPaymentsQuerySchema = z.object({
  limit: z
    .string()
    .optional()
    .transform((value) => {
      if (!value) {
        return DEFAULT_LIMIT;
      }

      const parsed = Number(value);
      if (!Number.isFinite(parsed)) {
        return DEFAULT_LIMIT;
      }

      return Math.min(Math.max(Math.trunc(parsed), 1), MAX_LIMIT);
    }),

  cursor: emptyStringToUndefined
    .optional()
    .refine((value) => !value || mongoose.isValidObjectId(value), { message: 'Invalid cursor id' }),

  orderId: emptyStringToUndefined
    .optional()
    .refine((value) => !value || mongoose.isValidObjectId(value), { message: 'Invalid orderId' }),

  status: emptyStringToUndefined
    .optional()
    .refine((value) => !value || PAYMENT_STATUS_VALUES.includes(value), { message: 'Invalid status' }),
});

export type GetPaymentsQuery = z.infer<typeof GetPaymentsQuerySchema>;
