export type TicketStatus = 'available' | 'reserved' | 'sold' | string;

export type TicketDto = {
  id: string;
  title: string;
  price: number;
  status: TicketStatus;
  orderId?: string;
};

export type CursorPage<T> = {
  items: T[];
  pageInfo: {
    hasNextPage: boolean;
    nextCursor?: string;
  };
};

export type ListTicketsQuery = {
  limit?: number;
  cursor?: string;
  userId?: string;
  q?: string;
  reserved?: boolean;
};
