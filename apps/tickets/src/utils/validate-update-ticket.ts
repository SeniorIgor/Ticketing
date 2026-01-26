import type { ErrorDetail } from '@org/core';

import type { UpdateTicketReqBody } from '../types';

import { validatePrice } from './validate-price';
import { validateTitle } from './validate-title';

export function validateUpdateTicket(body: Partial<UpdateTicketReqBody>): ErrorDetail[] {
  return [...validateTitle(body.title, { required: false }), ...validatePrice(body.price, { required: false })];
}
