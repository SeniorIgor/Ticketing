export const OrderStatus = {
  Created: 'created',
  Cancelled: 'cancelled',
  AwaitingPayment: 'awaiting_payment',
  Complete: 'complete',
} as const;

export type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus];
