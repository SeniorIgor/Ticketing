export type QueryValue = string | number | boolean | null | undefined;

// Allow repeatable query params: status=a&status=b
export type QueryValueOrArray = QueryValue | readonly (string | number | boolean)[];

export type QueryRecord = Record<string, QueryValueOrArray>;

/**
 * Builds a query string from a record.
 * - skips null/undefined/empty-string by default
 * - serializes booleans/numbers
 * - returns "" or "?a=1&b=2"
 */
export function buildQueryString(query: QueryRecord | undefined, options?: { skipEmptyString?: boolean }): string {
  if (!query) {
    return '';
  }

  const { skipEmptyString = true } = options ?? {};
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null) {
      continue;
    }

    const appendOne = (v: string | number | boolean) => {
      if (typeof v === 'string') {
        const trimmed = v.trim();
        if (skipEmptyString && trimmed.length === 0) {
          return;
        }
        params.append(key, trimmed);
        return;
      }

      params.append(key, String(v));
    };

    if (Array.isArray(value)) {
      for (const v of value) {
        appendOne(v);
      }
      continue;
    }

    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (skipEmptyString && trimmed.length === 0) {
        continue;
      }
      params.set(key, trimmed);
      continue;
    }

    params.set(key, String(value));
  }

  const queryString = params.toString();
  return queryString ? `?${queryString}` : '';
}
