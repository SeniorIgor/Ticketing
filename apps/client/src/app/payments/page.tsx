import Link from 'next/link';

import { ROUTES } from '@/constants';
import { PaymentCard } from '@/modules/payments';
import { listPayments } from '@/services/payments';

export default async function PaymentsPage() {
  const res = await listPayments({ limit: 20 });

  if (!res.ok) {
    return (
      <div className="container py-4">
        <div className="alert alert-danger mb-0">Failed to load payments.</div>
      </div>
    );
  }

  const page = res.data;

  return (
    <div className="container py-4">
      <div className="d-flex align-items-start justify-content-between gap-3 flex-wrap">
        <div>
          <h1 className="mb-1">Payments</h1>
          <p className="text-muted mb-0">Your payment history and receipts.</p>
        </div>

        <Link href={ROUTES.orders.root} className="btn btn-outline-secondary">
          Back to orders
        </Link>
      </div>

      <hr className="my-4" />

      {page.items.length === 0 ? (
        <div className="card border-0 shadow-sm rounded-4">
          <div className="card-body p-4">
            <div className="fw-semibold mb-1">No payments yet</div>
            <div className="text-muted mb-3">Once you pay for an order, receipts will appear here.</div>
            <Link href={ROUTES.tickets.root} className="btn btn-primary">
              Browse tickets
            </Link>
          </div>
        </div>
      ) : (
        <div className="row g-4">
          {page.items.map((p) => (
            <div key={p.id} className="col-12 col-md-6 col-lg-4">
              <PaymentCard payment={p} />
            </div>
          ))}
        </div>
      )}

      {page.pageInfo.hasNextPage ? (
        <div className="text-muted small mt-4">More payments exist (pagination UI can be added when needed).</div>
      ) : null}
    </div>
  );
}
