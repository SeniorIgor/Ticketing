export type SearchParams = Record<string, string | string[] | undefined>;

/**
 * Reads a string param from Next.js searchParams.
 * If the param is an array, takes the first element.
 */
export function getStringParam(searchParams: SearchParams | undefined, key: string): string | undefined {
  const rawValue = searchParams?.[key];
  const value = Array.isArray(rawValue) ? rawValue[0] : rawValue;
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

/**
 * Common helper for `q` search query.
 */
export function getSearchQuery(searchParams: SearchParams | undefined): string {
  return getStringParam(searchParams, 'q') ?? '';
}
