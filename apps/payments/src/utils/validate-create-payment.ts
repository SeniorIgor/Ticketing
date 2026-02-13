import type { ErrorDetail } from '@org/core';

import type { CreatePaymentReqBody } from '../types/requests';

export function validateCreatePayment(body: CreatePaymentReqBody): ErrorDetail[] {
  const errors: ErrorDetail[] = [];

  if (!body.orderId || body.orderId.trim().length === 0) {
    errors.push({ fieldName: 'orderId', message: 'orderId is required' });
  }

  if (!body.token || body.token.trim().length === 0) {
    errors.push({ fieldName: 'token', message: 'token is required' });
  }

  return errors;
}
