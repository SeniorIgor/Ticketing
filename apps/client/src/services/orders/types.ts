export type OrderStatus = 'created' | 'cancelled' | 'awaiting_payment' | 'complete';

export type OrderTicketDto = {
  id: string;
  title: string;
  price: number;
};

export type OrderDto = {
  id: string;
  status: OrderStatus;
  expiresAt: string;
  ticket: OrderTicketDto;
};
