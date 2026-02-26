import { makeSafeRequest } from '@/http';

import type { TicketDto } from './types';

export type CreateTicketRequest = {
  title: string;
  price: number;
};

export function createTicket(body: CreateTicketRequest) {
  return makeSafeRequest<TicketDto, CreateTicketRequest>('/api/v1/tickets', {
    method: 'POST',
    body,
  });
}
