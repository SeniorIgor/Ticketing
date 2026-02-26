import type { TicketStatus } from '@/services/tickets';
import { TicketStatusValues } from '@/services/tickets';

import type { SearchParams } from '../searchParams';

import { toStringArray } from './toStringArray';

export function getStatusFromSearchParams(sp?: SearchParams): TicketStatus[] | undefined {
  const raw = toStringArray(sp?.status)
    .map((x) => x.trim())
    .filter(Boolean);

  const filtered = raw.filter((s): s is TicketStatus => (TicketStatusValues as readonly string[]).includes(s));
  return filtered.length ? filtered : undefined;
}
