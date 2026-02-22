export const OrderSubjects = {
  OrderCreated: 'orders.created',
  OrderCancelled: 'orders.cancelled',
  OrderCompleted: 'orders.completed',
} as const;

export type OrderSubject = (typeof OrderSubjects)[keyof typeof OrderSubjects];
