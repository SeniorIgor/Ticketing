import { makeSafeRequest } from '@/http';

import type { PaymentDetailsDto } from './types';

export async function getPayment(id: string) {
  return makeSafeRequest<PaymentDetailsDto>(`/api/v1/payments/${id}`);
}
