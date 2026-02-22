export const PaymentStatuses = {
  Succeeded: 'succeeded',
  Failed: 'failed',
} as const;

export type PaymentStatus = (typeof PaymentStatuses)[keyof typeof PaymentStatuses];
