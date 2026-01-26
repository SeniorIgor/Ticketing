import type { ErrorDetail } from '@org/core';

import type { CreateTicketReqBody } from '../types';

import { validatePrice } from './validate-price';
import { validateTitle } from './validate-title';

export function validateCreateTicket(body: Partial<CreateTicketReqBody>): ErrorDetail[] {
  return [...validateTitle(body.title, { required: true }), ...validatePrice(body.price, { required: true })];
}
