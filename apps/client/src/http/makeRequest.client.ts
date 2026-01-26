import { HttpError } from './errors';
import { generateRequestId } from './requestId';
import { safeParseJson } from './safeParseJson';
import type { MakeRequestOptions } from './types';

export async function makeRequestClient<TResponse, TBody = unknown>(
  url: string,
  options: MakeRequestOptions<TBody> = {},
): Promise<TResponse> {
  const requestId = generateRequestId();

  const res = await fetch(url, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'x-request-id': requestId,
      ...options.headers,
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (!res.ok) {
    const errorBody = await safeParseJson(res);
    throw new HttpError(res.status, errorBody, requestId);
  }

  if (res.status === 204) {
    return undefined as TResponse;
  }

  return (await safeParseJson(res)) as TResponse;
}
