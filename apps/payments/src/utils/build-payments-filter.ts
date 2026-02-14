import type { QueryFilter } from 'mongoose';

import type { PaymentDoc } from '../models/payment';

import type { GetPaymentsQuery } from './validate-get-payments';

export function buildPaymentsFilter(userId: string, query: GetPaymentsQuery): QueryFilter<PaymentDoc> {
  const filter: QueryFilter<PaymentDoc> = { userId };

  if (query.orderId) {
    filter.order = query.orderId;
  }

  if (query.status) {
    filter.status = query.status;
  }

  if (query.cursor) {
    filter._id = { $lt: query.cursor };
  }

  return filter;
}
