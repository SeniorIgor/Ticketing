export const TicketStatuses = {
  Available: 'available',
  Reserved: 'reserved',
  Sold: 'sold',
} as const;

export type TicketStatus = (typeof TicketStatuses)[keyof typeof TicketStatuses];

export const TicketStatusValues = Object.values(TicketStatuses);
