import { HttpError } from './errors';
import { makeRequest } from './makeRequest';
import type { MakeRequestOptions, Result } from './types';

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
    throw err;
  }
}
