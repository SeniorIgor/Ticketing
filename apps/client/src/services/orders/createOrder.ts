import { makeSafeRequest } from '@/http';

import type { OrderDto } from './types';

export function createOrder(ticketId: string) {
  return makeSafeRequest<OrderDto>('/api/v1/orders', {
    method: 'POST',
    body: { ticketId },
  });
}
