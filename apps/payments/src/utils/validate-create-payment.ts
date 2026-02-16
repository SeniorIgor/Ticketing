import mongoose from 'mongoose';
import { z } from 'zod';

/**
 * Create payment body.
 *
 * `token` is a historical name.
 * For PaymentIntents it should contain a Stripe PaymentMethod id ("pm_..."),
 * created on the frontend using Stripe.js (or "pm_card_visa" in test mode).
 */
export const CreatePaymentBodySchema = z.object({
  orderId: z
    .string()
    .transform((v) => v.trim())
    .refine((v) => v.length > 0, { message: 'orderId is required' })
    .refine((v) => mongoose.isValidObjectId(v), { message: 'Invalid orderId' }),

  token: z
    .string()
    .transform((v) => v.trim())
    .refine((v) => v.length > 0, { message: 'token is required' }),
});

export type CreatePaymentReqBody = z.infer<typeof CreatePaymentBodySchema>;
