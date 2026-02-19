import { makeSafeRequest } from '@/http';

import type { OrderDto } from './types';

export function getOrder(orderId: string) {
  return makeSafeRequest<OrderDto>(`/api/v1/orders/${orderId}`, {
    method: 'GET',
  });
}
