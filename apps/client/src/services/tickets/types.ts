export const TicketStatuses = {
  Available: 'available',
  Reserved: 'reserved',
  Sold: 'sold',
} as const;

export type TicketStatus = (typeof TicketStatuses)[keyof typeof TicketStatuses];
export const TicketStatusValues = Object.values(TicketStatuses) as readonly TicketStatus[];

export type TicketDto = {
  id: string;
  title: string;
  price: number;
  status: TicketStatus;
  orderId?: string;
};

export type ListTicketsQuery = {
  limit?: number;
  cursor?: string;
  userId?: string;
  q?: string;
  status?: TicketStatus[];
};
