import mongoose from 'mongoose';
import { z } from 'zod';

const MAX_LIMIT = 100;
const DEFAULT_LIMIT = 20;

const emptyStringToUndefined = z.string().transform((value) => {
  const trimmed = value.trim();
  return trimmed.length === 0 ? undefined : trimmed;
});

const toBool = (value: unknown): boolean | undefined => {
  if (value === undefined) {
    return undefined;
  }
  if (value === 'true' || value === true) {
    return true;
  }
  if (value === 'false' || value === false) {
    return false;
  }
  return undefined;
};

export const GetTicketsQuerySchema = z.object({
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

  // Ticket.userId in your model is a string (from JWT), not ObjectId.
  userId: emptyStringToUndefined.optional(),

  q: emptyStringToUndefined.optional().transform((v) => (v ? v.trim() : undefined)),

  reserved: z
    .any()
    .optional()
    .transform((v) => toBool(v))
    .refine((v) => v === undefined || typeof v === 'boolean', { message: 'Invalid reserved value' }),
});

export type GetTicketsQuery = z.infer<typeof GetTicketsQuerySchema>;
