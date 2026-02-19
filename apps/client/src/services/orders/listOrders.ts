import { makeSafeRequest } from '@/http';

import type { OrderDto } from './types';

export function listOrders() {
  return makeSafeRequest<OrderDto[]>('/api/v1/orders', {
    method: 'GET',
  });
}
