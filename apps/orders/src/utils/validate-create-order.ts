import mongoose from 'mongoose';

import type { ErrorDetail } from '@org/core';

import type { CreateOrderReqBody } from '../types';

export function validateCreateOrder(body: Partial<CreateOrderReqBody>): ErrorDetail[] {
  const errors: ErrorDetail[] = [];

  if (typeof body.ticketId !== 'string' || body.ticketId.trim().length === 0) {
    errors.push({ fieldName: 'ticketId', message: 'ticketId is required' });
    return errors;
  }

  if (!mongoose.isValidObjectId(body.ticketId)) {
    errors.push({ fieldName: 'ticketId', message: 'ticketId must be a valid ObjectId' });
  }

  return errors;
}
