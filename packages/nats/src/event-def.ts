import type { z } from 'zod';

import type { Subject } from './subjects';

export type EventDef<TSubject extends Subject, TData> = {
  subject: TSubject;
  type: string; // e.g. "TicketCreated"
  version: number; // schema version
  schema: z.ZodType<TData>;
};

export function defineEvent<TSubject extends Subject, TData>(def: EventDef<TSubject, TData>) {
  return def;
}
