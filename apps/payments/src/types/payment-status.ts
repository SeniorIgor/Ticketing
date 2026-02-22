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
