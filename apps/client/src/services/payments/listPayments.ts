import { makeSafeRequest } from '@/http';
import type { Paginated } from '@/types/pagination';
import { buildQueryString } from '@/utils';

import type { PaymentListItemDto, PaymentStatus } from './types';

export type ListPaymentsParams = {
  limit?: number;
  cursor?: string;
  orderId?: string;
  status?: PaymentStatus;
};

export async function listPayments(params: ListPaymentsParams = {}) {
  return makeSafeRequest<Paginated<PaymentListItemDto>>(`/api/v1/payments${buildQueryString(params)}`);
}
