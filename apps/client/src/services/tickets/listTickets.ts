import { makeSafeRequest } from '@/http';
import { buildQueryString } from '@/utils';

import type { CursorPage, ListTicketsQuery, TicketDto } from './types';

export function listTickets(query?: ListTicketsQuery) {
  const queryString = buildQueryString({
    limit: query?.limit,
    cursor: query?.cursor,
    userId: query?.userId,
    q: query?.q,
    reserved: typeof query?.reserved === 'boolean' ? query.reserved : undefined,
  });

  return makeSafeRequest<CursorPage<TicketDto>>(`/api/v1/tickets${queryString}`, {
    method: 'GET',
  });
}
