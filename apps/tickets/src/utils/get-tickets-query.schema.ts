import mongoose from 'mongoose';
import { z } from 'zod';

import type { TicketStatus } from '@org/contracts';
import { TicketStatusValues } from '@org/contracts';

const MAX_LIMIT = 100;
const DEFAULT_LIMIT = 20;

const emptyStringToUndefined = z.string().transform((value) => {
  const trimmed = value.trim();
  return trimmed.length === 0 ? undefined : trimmed;
});

// helper: normalize query param to string[]
function toStringArray(value: unknown): string[] {
  if (value === undefined || value === null) {
    return [];
  }
  if (Array.isArray(value)) {
    return value.map(String);
  }
  return [String(value)];
}

/**
 * Accept:
 * - status=available
 * - status=available&status=sold
 *
 * Output type: TicketStatus[] | undefined
 */
const statusSchema: z.ZodType<TicketStatus[] | undefined> = z
  .any()
  .optional()
  .transform((v): TicketStatus[] | undefined => {
    const raw = toStringArray(v)
      .map((x) => x.trim())
      .filter(Boolean);
    if (raw.length === 0) {
      return undefined;
    }

    // validate against allowed values
    for (const s of raw) {
      if (!TicketStatusValues.includes(s as TicketStatus)) {
        // throw in transform to keep fieldName=status in ValidationError details
        // (your validate() wrapper will format it)
        throw new Error('Invalid status value');
      }
    }

    return raw as TicketStatus[];
  });

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

  status: statusSchema,
});

export type GetTicketsQuery = z.infer<typeof GetTicketsQuerySchema>;
