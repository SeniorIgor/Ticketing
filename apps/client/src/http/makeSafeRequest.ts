import { HttpError } from './errors';
import { makeRequest } from './makeRequest';
import type { MakeRequestOptions, Result } from './types';

function isDynamicServerUsageError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }

  const dynamicError = error as Error & { digest?: unknown };
  return dynamicError.digest === 'DYNAMIC_SERVER_USAGE';
}

export async function makeSafeRequest<TResponse, TBody = unknown>(
  url: string,
  options?: MakeRequestOptions<TBody>,
): Promise<Result<TResponse, HttpError>> {
  try {
    const data = await makeRequest<TResponse, TBody>(url, options);
    return { ok: true, data };
  } catch (err) {
    if (err instanceof HttpError) {
      return { ok: false, error: err };
    }

    const message = err instanceof Error ? err.message : 'Network request failed';
    if (!isDynamicServerUsageError(err)) {
      const cause = err instanceof Error ? (err as Error & { cause?: unknown }).cause : undefined;

      console.error('[http] transport error', {
        url,
        method: options?.method ?? 'GET',
        message,
        cause,
      });
    }

    return {
      ok: false,
      error: new HttpError(503, { code: 'UPSTREAM_UNAVAILABLE', message }),
    };
  }
}
