import mongoose from 'mongoose';
import { z } from 'zod';

export const CreatePaymentIntentBodySchema = z.object({
  orderId: z
    .string()
    .transform((v) => v.trim())
    .refine((v) => v.length > 0, { message: 'orderId is required' })
    .refine((v) => mongoose.isValidObjectId(v), { message: 'Invalid orderId' }),
});

export type CreatePaymentIntentReqBody = z.infer<typeof CreatePaymentIntentBodySchema>;
