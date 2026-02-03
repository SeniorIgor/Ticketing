import type { z } from 'zod';

export type EventDef<TSubject extends string, TData> = {
  subject: TSubject;
  type: string; // e.g. "TicketCreated"
  version: number; // schema version
  schema: z.ZodType<TData>;
};

export function defineEvent<TSubject extends string, TData>(def: EventDef<TSubject, TData>) {
  return def;
}
