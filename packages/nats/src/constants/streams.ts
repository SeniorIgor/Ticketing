export const Streams = {
  Orders: 'ORDERS',
  Tickets: 'TICKETS',
} as const;

export type Stream = (typeof Streams)[keyof typeof Streams];
