import { isServer } from '@/utils';

import { makeRequestClient } from './makeRequest.client';
import { makeRequestServer } from './makeRequest.server';
import type { MakeRequestOptions } from './types';

export function makeRequest<TResponse, TBody = unknown>(
  url: string,
  options?: MakeRequestOptions<TBody>,
): Promise<TResponse> {
  if (isServer()) {
    return makeRequestServer<TResponse, TBody>(url, options);
  }

  return makeRequestClient<TResponse, TBody>(url, options);
}
