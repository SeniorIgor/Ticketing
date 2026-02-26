import type { OrderStatus } from '@/services/orders';

export type OrderStatusUi = {
  label: string;
  badgeClass: string;
  payable: boolean;
};

export const ORDER_STATUS_UI: Record<OrderStatus, OrderStatusUi> = {
  created: {
    label: 'Created',
    badgeClass: 'text-bg-primary',
    payable: true,
  },
  awaiting_payment: {
    label: 'Awaiting payment',
    badgeClass: 'text-bg-warning',
    payable: true,
  },
  complete: {
    label: 'Complete',
    badgeClass: 'text-bg-success',
    payable: false,
  },
  cancelled: {
    label: 'Cancelled',
    badgeClass: 'text-bg-light border',
    payable: false,
  },
};

export function getOrderStatusUi(status: OrderStatus): OrderStatusUi {
  return ORDER_STATUS_UI[status];
}

export function isOrderPayable(status: OrderStatus): boolean {
  return ORDER_STATUS_UI[status].payable;
}

export function getOrderStatusBadgeClass(status: OrderStatus): string {
  return ORDER_STATUS_UI[status].badgeClass;
}

export function getOrderStatusLabel(status: OrderStatus): string {
  return ORDER_STATUS_UI[status].label;
}
