import Link from 'next/link';

import { ROUTES } from '@/constants';
import type { PaymentListItemDto } from '@/services/payments';
import { formatPrice } from '@/utils';

import { PaymentStatusBadge } from '../PaymentStatusBadge/PaymentStatusBadge';

type Props = {
  payment: PaymentListItemDto;
};

export function PaymentCard({ payment }: Props) {
  const amount = payment.amount / 100;
  const createdAt = payment.createdAt ? new Date(payment.createdAt).toLocaleString() : null;

  return (
    <div className="card border-0 shadow-sm rounded-4 h-100">
      <div className="card-body p-4 d-flex flex-column gap-3">
        <div className="d-flex justify-content-between align-items-start gap-3">
          <div className="flex-grow-1">
            <div className="text-muted small">Payment #{payment.id.slice(-6)}</div>
            <div className="fw-semibold text-truncate">
              {payment.provider ? payment.provider.toUpperCase() : 'Payment'}
            </div>
          </div>

          <PaymentStatusBadge status={payment.status} />
        </div>

        <div className="d-flex justify-content-between align-items-end gap-3">
          <div>
            <div className="text-muted small">Amount</div>
            <div className="fs-4 fw-bold text-primary">{formatPrice(amount)}</div>
          </div>

          {createdAt ? <div className="text-muted small text-end">{createdAt}</div> : null}
        </div>

        <hr className="my-1 opacity-25" />

        <div className="d-flex gap-2 mt-auto flex-wrap">
          <Link href={ROUTES.payments.details(payment.id)} className="btn btn-outline-primary">
            View receipt
          </Link>

          <Link href={ROUTES.orders.details(payment.order)} className="btn btn-outline-secondary">
            View order
          </Link>
        </div>
      </div>
    </div>
  );
}
