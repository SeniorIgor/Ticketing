import type { NextRequest } from 'next/server';

import { randomUUID } from 'crypto';

export const REQUEST_ID_HEADER = 'x-request-id';

export function getRequestId(request: NextRequest): string {
  return request.headers.get(REQUEST_ID_HEADER) ?? randomUUID();
}
