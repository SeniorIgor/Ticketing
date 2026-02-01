import crypto from 'node:crypto';
import { z } from 'zod';

export const EventEnvelopeSchema = z.object({
  id: z.string().min(1),
  type: z.string().min(1),
  subject: z.string().min(1),
  version: z.number().int().nonnegative(),
  time: z.string().min(1), // ISO
  correlationId: z.string().optional(),
  causationId: z.string().optional(),
  data: z.unknown(),
});

export type EventEnvelope<TData> = Omit<z.infer<typeof EventEnvelopeSchema>, 'data'> & {
  data: TData;
};

export type EventDef<TSubject extends string, TData> = {
  subject: TSubject;
  type: string; // e.g. "TicketCreated"
  version: number; // schema version
  schema: z.ZodType<TData>;
};

export function makeEnvelope<TSubject extends string, TData>(
  def: EventDef<TSubject, TData>,
  data: TData,
  meta?: { correlationId?: string; causationId?: string; id?: string; time?: string },
): EventEnvelope<TData> {
  return {
    id: meta?.id ?? crypto.randomUUID(),
    type: def.type,
    subject: def.subject,
    version: def.version,
    time: meta?.time ?? new Date().toISOString(),
    correlationId: meta?.correlationId,
    causationId: meta?.causationId,
    data,
  };
}
