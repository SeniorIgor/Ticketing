import { makeSafeRequest } from '@/http';
import type { Paginated } from '@/types';
import { buildQueryString } from '@/utils';

import type { ListTicketsQuery, TicketDto } from './types';

export function listTickets(query?: ListTicketsQuery) {
  const queryString = buildQueryString({
    limit: query?.limit,
    cursor: query?.cursor,
    userId: query?.userId,
    q: query?.q,
    status: query?.status,
  });

  return makeSafeRequest<Paginated<TicketDto>>(`/api/v1/tickets${queryString}`, { method: 'GET' });
}
