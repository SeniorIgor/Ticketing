export const Streams = {
  Orders: 'ORDERS',
  Tickets: 'TICKETS',
  Expiration: 'EXPIRATION',
  Payments: 'PAYMENTS',
} as const;

export type Stream = (typeof Streams)[keyof typeof Streams];
