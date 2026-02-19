import Link from 'next/link';
import { redirect } from 'next/navigation';

import { ROUTES } from '@/constants';
import { OrderCard } from '@/modules/orders/components';
import { listOrders } from '@/services/orders/listOrders';

export default async function OrdersPage() {
  const ordersRes = await listOrders();

  if (!ordersRes.ok) {
    // If cookie expired between middleware and render, still handle it safely.
    if (ordersRes.error.status === 401) {
      redirect(ROUTES.signIn);
    }

    return (
      <div className="container py-4">
        <div className="alert alert-danger mb-0">Failed to load orders. Please try again later.</div>
      </div>
    );
  }

  const orders = ordersRes.data;

  return (
    <div className="container py-4">
      <div className="d-flex align-items-start justify-content-between gap-3 flex-wrap">
        <div>
          <h1 className="mb-1">My orders</h1>
          <p className="text-muted mb-0">Track your purchases and payment deadlines.</p>
        </div>

        <Link href={ROUTES.tickets.root} className="btn btn-outline-secondary">
          Browse tickets
        </Link>
      </div>

      <hr className="my-4" />

      {orders.length === 0 ? (
        <div className="card border-0 shadow-sm rounded-4">
          <div className="card-body p-4">
            <div className="fw-semibold mb-1">No orders yet</div>
            <div className="text-muted mb-3">Purchase a ticket to see it here.</div>
            <Link href={ROUTES.tickets.root} className="btn btn-primary">
              Browse tickets
            </Link>
          </div>
        </div>
      ) : (
        <div className="row g-4">
          {orders.map((order) => (
            <div key={order.id} className="col-12 col-md-6 col-lg-4">
              <OrderCard order={order} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
