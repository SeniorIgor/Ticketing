'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

import { ROUTES } from '@/constants';
import { createOrder } from '@/services/orders';
import { getErrorMessage } from '@/utils';

type CreateOrderProps = {
  ticketId: string;
};

export function CreateOrder({ ticketId }: CreateOrderProps) {
  const router = useRouter();

  const [submitting, setSubmitting] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // 🔒 prevent double execution in StrictMode
  const executedRef = useRef(false);

  useEffect(() => {
    if (executedRef.current) {
      return;
    }
    executedRef.current = true;

    let cancelled = false;

    async function run() {
      setSubmitting(true);
      setErrorMessage(null);

      const res = await createOrder(ticketId);

      if (cancelled) {
        return;
      }

      if (!res.ok) {
        setErrorMessage(getErrorMessage(res.error, 'Failed to create order.'));
        setSubmitting(false);
        return;
      }

      router.replace(ROUTES.orders.details(res.data.id));
    }

    run();

    return () => {
      cancelled = true;
    };
  }, [router, ticketId]);

  const content = useMemo(() => {
    if (submitting) {
      return (
        <div className="card border-0 shadow-sm rounded-4">
          <div className="card-body p-5">
            <div className="placeholder-glow">
              <div className="placeholder col-6 mb-2 rounded" style={{ height: 18 }} />
              <div className="placeholder col-10 mb-4 rounded" style={{ height: 14 }} />
              <div className="placeholder col-12 rounded" style={{ height: 44 }} />
            </div>
            <div className="text-muted small mt-3">Creating your order…</div>
          </div>
        </div>
      );
    }

    return (
      <div className="card border-0 shadow-sm rounded-4">
        <div className="card-body p-5">
          <h1 className="h4 fw-semibold mb-2">Couldn’t create the order</h1>
          <p className="text-muted mb-4">{errorMessage ?? 'Please try again.'}</p>

          <div className="d-flex gap-2 flex-wrap">
            <button className="btn btn-primary" onClick={() => router.refresh()}>
              Retry
            </button>
            <button className="btn btn-outline-secondary" onClick={() => router.push(ROUTES.tickets.root)}>
              Back to tickets
            </button>
          </div>
        </div>
      </div>
    );
  }, [errorMessage, router, submitting]);

  return content;
}
