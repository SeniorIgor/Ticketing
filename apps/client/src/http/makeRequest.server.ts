'use server';

import { cookies, headers } from 'next/headers';

import { HttpError } from './errors';
import { generateRequestId } from './requestId';
import { safeParseJson } from './safeParseJson';
import type { MakeRequestOptions } from './types';

const INTERNAL_API_BASE_URL = process.env.INTERNAL_API_BASE_URL;

export async function makeRequestServer<TResponse, TBody = unknown>(
  path: string,
  options: MakeRequestOptions<TBody> = {},
): Promise<TResponse> {
  const cookieStore = await cookies();
  const headerStore = await headers();

  const incomingRequestId = headerStore.get('x-request-id') ?? generateRequestId();

  const cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join('; ');

  const res = await fetch(`${INTERNAL_API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      cookie: cookieHeader,
      'x-request-id': incomingRequestId,
      'x-forwarded-host': headerStore.get('host') ?? '',
      'x-forwarded-proto': headerStore.get('x-forwarded-proto') ?? 'https',
      ...options.headers,
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
    cache: 'no-store',
  });

  console.log({ res, host: headerStore.get('host') });

  if (!res.ok) {
    const errorBody = await safeParseJson(res);
    throw new HttpError(res.status, errorBody, incomingRequestId);
  }

  if (res.status === 204) {
    return undefined as TResponse;
  }

  return (await safeParseJson(res)) as TResponse;
}
