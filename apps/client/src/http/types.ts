export type Result<T, E = unknown> = { ok: true; data: T } | { ok: false; error: E };

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export type MakeRequestOptions<TBody = unknown> = Omit<RequestInit, 'method' | 'body'> & {
  method?: HttpMethod;
  body?: TBody;
};
