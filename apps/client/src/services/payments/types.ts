import type { OrderStatus } from '../orders';

export const PaymentStatuses = {
  RequiresPaymentMethod: 'requires_payment_method',
  RequiresAction: 'requires_action',
  Processing: 'processing',
  Succeeded: 'succeeded',
  Failed: 'failed',
  Canceled: 'canceled',
} as const;

export type PaymentStatus = (typeof PaymentStatuses)[keyof typeof PaymentStatuses];
export const PaymentStatusValues = Object.values(PaymentStatuses) as readonly PaymentStatus[];

export type PaymentProvider = 'stripe';

export type PaymentListItemDto = {
  id: string;
  order: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  provider: PaymentProvider;
  createdAt: string;
};

export type PaymentOrderDto = {
  id: string;
  status: OrderStatus;
  price: number;
};

export type PaymentDetailsDto = {
  id: string;
  order: PaymentOrderDto; // populated
  amount: number; // cents
  currency: string;
  status: PaymentStatus;
  provider: PaymentProvider;
  createdAt: string;
};
