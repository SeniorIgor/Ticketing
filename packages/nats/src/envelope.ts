import crypto from 'node:crypto';
import { z } from 'zod';

export const EventEnvelopeSchema = z.object({
  id: z.string().min(1),
  type: z.string().min(1),
  subject: z.string().min(1),
  version: z.number().int().nonnegative(),
  time: z.string().min(1), // ISO string
  correlationId: z.string().optional(),
  causationId: z.string().optional(),
  data: z.unknown(),
});

export type EventEnvelope<TData> = Omit<z.infer<typeof EventEnvelopeSchema>, 'data'> & {
  data: TData;
};

interface MakeEnvelopeParamsMeta {
  id?: string;
  time?: string;
  correlationId?: string;
  causationId?: string;
}

interface MakeEnvelopeParams<TData> {
  subject: string;
  type: string;
  version: number;
  data: TData;
  meta?: MakeEnvelopeParamsMeta;
}

export function makeEnvelope<TData>({
  data,
  subject,
  type,
  version,
  meta,
}: MakeEnvelopeParams<TData>): EventEnvelope<TData> {
  return {
    id: meta?.id ?? crypto.randomUUID(),
    type,
    subject,
    version,
    time: meta?.time ?? new Date().toISOString(),
    correlationId: meta?.correlationId,
    causationId: meta?.causationId,
    data,
  };
}
