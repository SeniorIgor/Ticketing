import type { MsgHdrs } from 'nats';

export function getHeader(headers: MsgHdrs | undefined, key: string): string | undefined {
  if (!headers) {
    return undefined;
  }

  const value = headers.get(key);
  return value ?? undefined;
}

export function setHeader(headers: MsgHdrs, key: string, value: string | undefined) {
  if (!value) {
    return;
  }

  headers.set(key, value);
}
