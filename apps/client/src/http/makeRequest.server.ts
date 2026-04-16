'use server';

import { cookies, headers } from 'next/headers';

import { HttpError } from './errors';
import { generateRequestId } from './requestId';
import { safeParseJson } from './safeParseJson';
import type { MakeRequestOptions } from './types';

const INTERNAL_API_BASE_URL = process.env.INTERNAL_API_BASE_URL;
const FETCH_RETRY_ATTEMPTS = 2;
const FETCH_RETRY_DELAY_MS = 200;
const RETRYABLE_CAUSE_CODES = new Set([
  'ECONNREFUSED',
  'ECONNRESET',
  'ETIMEDOUT',
  'EAI_AGAIN',
  'UND_ERR_SOCKET',
  'UND_ERR_CONNECT_TIMEOUT',
]);
const RETRYABLE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

type ErrorWithCode = {
  code?: unknown;
  errno?: unknown;
};

type ErrorWithCause = Error & ErrorWithCode & { cause?: unknown };

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function asString(value: unknown): string | undefined {
  return typeof value === 'string' ? value : undefined;
}

function getErrorCode(error: ErrorWithCause): string | undefined {
  const directCode = asString(error.code) ?? asString(error.errno);
  if (directCode) {
    return directCode;
  }

  const cause = error.cause;
  if (!cause || typeof cause !== 'object') {
    return undefined;
  }

  const typedCause = cause as ErrorWithCode;
  return asString(typedCause.code) ?? asString(typedCause.errno);
}

function hasSocketCause(error: ErrorWithCause): boolean {
  const cause = error.cause;
  if (!cause || typeof cause !== 'object') {
    return false;
  }

  const causeName = asString((cause as { name?: unknown }).name);
  return causeName === 'SocketError';
}

function isRetryableFetchError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }

  const typedError = error as ErrorWithCause;
  const errorCode = getErrorCode(typedError);

  if (errorCode && RETRYABLE_CAUSE_CODES.has(errorCode)) {
    return true;
  }

  return hasSocketCause(typedError);
}

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
  const method = (options.method ?? 'GET').toUpperCase();
  const canRetry = RETRYABLE_METHODS.has(method);

  let res: Response | undefined;

  for (let attempt = 1; attempt <= FETCH_RETRY_ATTEMPTS; attempt++) {
    try {
      res = await fetch(`${INTERNAL_API_BASE_URL}${path}`, {
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
        cache: options.cache ?? 'no-store',
      });
      break;
    } catch (error) {
      if (!canRetry || attempt === FETCH_RETRY_ATTEMPTS || !isRetryableFetchError(error)) {
        throw error;
      }
      await sleep(FETCH_RETRY_DELAY_MS);
    }
  }

  if (!res) {
    throw new Error('Failed to perform upstream request');
  }

  if (!res.ok) {
    const errorBody = await safeParseJson(res);
    throw new HttpError(res.status, errorBody, incomingRequestId);
  }

  if (res.status === 204) {
    return undefined as TResponse;
  }

  return (await safeParseJson(res)) as TResponse;
}
