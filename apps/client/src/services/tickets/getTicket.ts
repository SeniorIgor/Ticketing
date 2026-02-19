import { makeSafeRequest } from '@/http';

import type { TicketDto } from './types';

export function getTicket(id: string) {
  return makeSafeRequest<TicketDto>(`/api/v1/tickets/${id}`, {
    method: 'GET',
  });
}
