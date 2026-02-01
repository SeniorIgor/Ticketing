import type { MsgHdrs } from 'nats';

export const HDR = {
  correlationId: 'x-correlation-id',
  causationId: 'x-causation-id',
  eventId: 'x-event-id',
  eventType: 'x-event-type',
  eventVersion: 'x-event-version',
  traceparent: 'traceparent',
} as const;

export function getHeader(h: MsgHdrs | undefined, key: string): string | undefined {
  if (!h) {
    return undefined;
  }
  const v = h.get(key);
  return v ?? undefined;
}

export function setHeader(h: MsgHdrs, key: string, value: string | undefined) {
  if (!value) {
    return;
  }
  h.set(key, value);
}
