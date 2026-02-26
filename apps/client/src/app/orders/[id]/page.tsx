import Link from 'next/link';
import { notFound } from 'next/navigation';

import { ROUTES } from '@/constants';
import { OrderBadge, OrderCountdownWithRefresh } from '@/modules/orders';
import { PayNowButton } from '@/modules/payments';
import { getOrder } from '@/services/orders';
import { formatPrice, isOrderPayable } from '@/utils';

type Params = { id: string };
type OrderDetailsPageProps = { params: Params | Promise<Params> };

export default async function OrderDetailsPage({ params }: OrderDetailsPageProps) {
  const { id } = await params;

  const res = await getOrder(id);

  if (!res.ok) {
    if (res.error.status === 404) {
      notFound();
    }
    throw res.error;
  }

  const order = res.data;
  const payable = isOrderPayable(order.status);

  const ticketTitle = order.ticket.title ?? `Ticket #${order.ticket.id.slice(-6)}`;

  return (
    <div className="container py-4" style={{ maxWidth: 760 }}>
      <div className="card border-0 shadow-sm rounded-4">
        <div className="card-body p-5">
          <div className="d-flex justify-content-between align-items-start gap-3">
            <div>
              <h1 className="h4 fw-semibold mb-1">Order</h1>
              <div className="text-muted small">Order #{order.id.slice(-6)}</div>
            </div>

            <OrderBadge status={order.status} />
          </div>

          <hr className="my-4" />

          <div className="row g-4">
            <div className="col-12 col-md-7">
              <div className="text-muted small">Ticket</div>
              <div className="fw-semibold">{ticketTitle}</div>
              <div className="text-muted small mt-1">Ticket ID #{order.ticket.id.slice(-6)}</div>
            </div>

            <div className="col-12 col-md-5">
              <div className="text-muted small">Price</div>
              <div className="fs-3 fw-bold text-primary">{formatPrice(order.ticket.price)}</div>
            </div>

            {payable && (
              <div className="col-12">
                <div className="card border-0 bg-light rounded-4">
                  <div className="card-body d-flex justify-content-between align-items-center flex-wrap gap-3">
                    <div>
                      <div className="fw-semibold">Complete payment before the timer ends</div>
                      <div className="text-muted small">Otherwise the order will be cancelled automatically.</div>
                    </div>

                    {payable && <OrderCountdownWithRefresh expiresAtIso={order.expiresAt} />}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="d-flex gap-2 flex-wrap mt-4">
            <Link className="btn btn-outline-secondary" href={ROUTES.orders.root}>
              ← Back to orders
            </Link>

            <Link className="btn btn-outline-primary" href={ROUTES.tickets.details(order.ticket.id)}>
              View ticket
            </Link>

            {payable ? <PayNowButton orderId={order.id} className="btn btn-success" /> : null}
          </div>

          <div className="text-muted small mt-3">Expires at: {new Date(order.expiresAt).toLocaleString()}</div>
        </div>
      </div>
    </div>
  );
}
