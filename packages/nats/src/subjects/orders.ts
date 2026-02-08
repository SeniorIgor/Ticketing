export const OrderSubjects = {
  OrderCreated: 'orders.created',
  OrderCancelled: 'orders.cancelled',
} as const;

export type OrderSubject = (typeof OrderSubjects)[keyof typeof OrderSubjects];
