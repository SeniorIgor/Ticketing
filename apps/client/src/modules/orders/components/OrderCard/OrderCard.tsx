import Link from 'next/link';

import { ROUTES } from '@/constants';
import { OrderBadge } from '@/modules/orders/components/OrderBadge/OrderBadge';
import type { OrderDto } from '@/services/orders';
import { formatPrice, isOrderPayable } from '@/utils';

import { OrderCountdown } from '../OrderCountdown/OrderCountdown';

type OrderCardProps = {
  order: OrderDto;
};

export function OrderCard({ order }: OrderCardProps) {
  const ticketTitle = order.ticket.title ?? `Ticket #${order.ticket.id.slice(-6)}`;
  const payable = isOrderPayable(order.status);

  return (
    <div className="card border-0 shadow-sm rounded-4 h-100">
      <div className="card-body p-4 d-flex flex-column gap-3">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-start gap-3">
          <div className="flex-grow-1">
            <div className="text-muted small">Order #{order.id.slice(-6)}</div>
            <div className="fw-semibold text-truncate">{ticketTitle}</div>
          </div>

          <OrderBadge status={order.status} />
        </div>

        {/* Price + Timer */}
        <div className="d-flex justify-content-between align-items-end gap-3">
          <div>
            <div className="text-muted small">Price</div>
            <div className="fs-4 fw-bold text-primary">{formatPrice(order.ticket.price)}</div>
          </div>

          {payable && <OrderCountdown expiresAtIso={order.expiresAt} />}
        </div>

        <hr className="my-1 opacity-25" />

        {/* Actions */}
        <div className="d-flex gap-2 mt-auto flex-wrap">
          <Link href={ROUTES.orders.details(order.id)} className="btn btn-primary">
            View
          </Link>

          {payable ? (
            <Link href={ROUTES.orders.details(order.id)} className="btn btn-success">
              Pay now
            </Link>
          ) : (
            <span className="text-muted small align-self-center">No action needed</span>
          )}
        </div>
      </div>
    </div>
  );
}
