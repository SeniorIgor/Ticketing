export const Streams = {
  Orders: 'ORDERS',
  Tickets: 'TICKETS',
  Expiration: 'EXPIRATION',
} as const;

export type Stream = (typeof Streams)[keyof typeof Streams];
