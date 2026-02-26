import clsx from 'clsx';

import type { PaymentStatus } from '@/services/payments';

type Props = { status: PaymentStatus };

function variant(status: PaymentStatus) {
  switch (status) {
    case 'succeeded':
      return 'bg-success';
    case 'failed':
    case 'canceled':
      return 'bg-danger';
    case 'processing':
    case 'requires_action':
    case 'requires_payment_method':
      return 'bg-warning text-dark';
    default:
      return 'bg-secondary';
  }
}

function label(status: PaymentStatus) {
  switch (status) {
    case 'succeeded':
      return 'Succeeded';
    case 'failed':
      return 'Failed';
    case 'canceled':
      return 'Canceled';
    case 'processing':
      return 'Processing';
    case 'requires_action':
      return 'Requires action';
    case 'requires_payment_method':
      return 'Payment method required';
    default:
      return status;
  }
}

export function PaymentStatusBadge({ status }: Props) {
  return <span className={clsx('badge rounded-pill', variant(status))}>{label(status)}</span>;
}
