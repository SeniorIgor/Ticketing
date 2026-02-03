export const HDR = {
  eventId: 'x-event-id',
  eventType: 'x-event-type',
  eventVersion: 'x-event-version',
  correlationId: 'x-correlation-id',
  causationId: 'x-causation-id',
  traceparent: 'traceparent',
} as const;

export type EventHeaderKey = (typeof HDR)[keyof typeof HDR];
