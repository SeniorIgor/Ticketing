export const OrderStatuses = {
  Created: 'created',
  Cancelled: 'cancelled',
  AwaitingPayment: 'awaiting_payment',
  Complete: 'complete',
} as const;

export type OrderStatus = (typeof OrderStatuses)[keyof typeof OrderStatuses];

export const OrderStatusValues = Object.values(OrderStatuses) as readonly OrderStatus[];
