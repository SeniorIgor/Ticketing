import mongoose from 'mongoose';
import { z } from 'zod';

export const ConfirmPaymentBodySchema = z.object({
  orderId: z
    .string()
    .transform((v) => v.trim())
    .refine((v) => v.length > 0, { message: 'orderId is required' })
    .refine((v) => mongoose.isValidObjectId(v), { message: 'Invalid orderId' }),

  paymentIntentId: z
    .string()
    .transform((v) => v.trim())
    .refine((v) => v.length > 0, { message: 'paymentIntentId is required' }),
});

export type ConfirmPaymentReqBody = z.infer<typeof ConfirmPaymentBodySchema>;
