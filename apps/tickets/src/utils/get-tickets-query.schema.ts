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
  // 1) normalize to string[] | undefined (no throwing)
  .transform((v): string[] | undefined => {
    const raw = toStringArray(v)
      .map((x) => x.trim())
      .filter(Boolean);

    return raw.length === 0 ? undefined : raw;
  })
  // 2) validate with refine so we get a proper Zod issue at path ["status"]
  .refine((raw) => raw === undefined || raw.every((s) => TicketStatusValues.includes(s as TicketStatus)), {
    message: 'Invalid status value',
  })
  // 3) cast to TicketStatus[] | undefined for downstream typing
  .transform((raw) => raw as TicketStatus[] | undefined);

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
