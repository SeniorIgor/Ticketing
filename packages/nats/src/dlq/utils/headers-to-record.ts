import type { MsgHdrs } from 'nats';

export function headersToRecord(msgHeaders: MsgHdrs | undefined): Record<string, string> | undefined {
  if (!msgHeaders) {
    return undefined;
  }

  const headers: Record<string, string> = {};

  if (msgHeaders) {
    for (const key of msgHeaders.keys()) {
      const value = msgHeaders.get(key);

      if (value !== null) {
        headers[key] = value;
      }
    }
  }

  return Object.keys(headers).length ? headers : undefined;
}
