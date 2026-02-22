import Link from 'next/link';
import { notFound } from 'next/navigation';

import { ROUTES } from '@/constants';
import { PaymentStatusBadge } from '@/modules/payments';
import { getPayment } from '@/services/payments';
import { formatPrice } from '@/utils';

type Params = { id: string };
type Props = { params: Params | Promise<Params> };

export default async function PaymentDetailsPage({ params }: Props) {
  const { id } = await params;
  const res = await getPayment(id);

  if (!res.ok) {
    if (res.error.status === 404) {
      notFound();
    }
    throw res.error;
  }

  const payment = res.data;
  const orderId = payment.order.id;

  const amount = payment.amount / 100;
  const createdAt = payment.createdAt ? new Date(payment.createdAt).toLocaleString() : null;

  return (
    <div className="container py-4" style={{ maxWidth: 760 }}>
      <div className="card border-0 shadow-sm rounded-4">
        <div className="card-body p-5">
          <div className="d-flex justify-content-between align-items-start gap-3">
            <div>
              <h1 className="h4 fw-semibold mb-1">Payment receipt</h1>
              <div className="text-muted small">Payment #{payment.id.slice(-6)}</div>
            </div>

            <PaymentStatusBadge status={payment.status} />
          </div>

          <hr className="my-4" />

          <div className="row g-4">
            <div className="col-12 col-md-6">
              <div className="text-muted small">Amount</div>
              <div className="fs-3 fw-bold text-primary">{formatPrice(amount)}</div>
              <div className="text-muted small mt-1">
                Currency: <span className="font-monospace">{payment.currency}</span>
              </div>
            </div>

            {payment.provider && (
              <div className="col-12 col-md-6">
                {payment.provider ? (
                  <>
                    <div className="text-muted small">Provider</div>
                    <div className="fw-semibold">{payment.provider.toUpperCase()}</div>
                  </>
                ) : null}
              </div>
            )}

            {createdAt ? (
              <div className="col-12">
                <div className="text-muted small">Created at</div>
                <div>{createdAt}</div>
              </div>
            ) : null}
          </div>

          <div className="d-flex gap-2 flex-wrap mt-4">
            <Link className="btn btn-outline-secondary" href={ROUTES.payments.root}>
              ← Back to payments
            </Link>

            <Link className="btn btn-outline-primary" href={ROUTES.orders.details(orderId)}>
              View related order
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
