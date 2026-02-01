import type { MsgHdrs } from 'nats';

export const HDR = {
  correlationId: 'x-correlation-id',
  causationId: 'x-causation-id',
  eventId: 'x-event-id',
  eventType: 'x-event-type',
  eventVersion: 'x-event-version',
  traceparent: 'traceparent',
} as const;

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
