import { emitUnauthorized } from '@/auth';

import { HttpError } from './errors';
import { generateRequestId } from './requestId';
import { safeParseJson } from './safeParseJson';
import type { MakeRequestOptions } from './types';

const REFRESH_ENDPOINT = '/api/v1/users/refresh';

let refreshRequestPromise: Promise<boolean> | null = null;

function buildRequestInit<TBody>(requestId: string, options: MakeRequestOptions<TBody>): RequestInit {
  return {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'x-request-id': requestId,
      ...options.headers,
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  };
}

async function refreshAccessToken(): Promise<boolean> {
  if (refreshRequestPromise) {
    return refreshRequestPromise;
  }

  refreshRequestPromise = (async () => {
    try {
      const res = await fetch(
        REFRESH_ENDPOINT,
        buildRequestInit(generateRequestId(), {
          method: 'POST',
        }),
      );

      return res.ok;
    } catch {
      return false;
    }
  })();

  try {
    return await refreshRequestPromise;
  } finally {
    refreshRequestPromise = null;
  }
}

export async function makeRequestClient<TResponse, TBody = unknown>(
  url: string,
  options: MakeRequestOptions<TBody> = {},
): Promise<TResponse> {
  const requestId = generateRequestId();

  let res = await fetch(url, buildRequestInit(requestId, options));

  if (res.status === 401 && url !== REFRESH_ENDPOINT) {
    const refreshed = await refreshAccessToken();

    if (refreshed) {
      res = await fetch(url, buildRequestInit(requestId, options));
    }
  }

  if (res.status === 401) {
    emitUnauthorized({
      requestId,
      url,
      method: (options.method ?? 'GET').toString().toUpperCase(),
    });

    const errorBody = await safeParseJson(res);
    throw new HttpError(res.status, errorBody, requestId);
  }

  if (!res.ok) {
    const errorBody = await safeParseJson(res);
    throw new HttpError(res.status, errorBody, requestId);
  }

  if (res.status === 204) {
    return undefined as TResponse;
  }

  return (await safeParseJson(res)) as TResponse;
}
