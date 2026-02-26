'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { ROUTES } from '@/constants';
import { createOrder } from '@/services/orders';
import { getErrorMessage } from '@/utils';

type BuyTicketButtonProps = {
  ticketId: string;
  className?: string;
};

export function BuyTicketButton({ ticketId, className }: BuyTicketButtonProps) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleClick() {
    if (loading) {
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    const res = await createOrder(ticketId);

    if (!res.ok) {
      setLoading(false);
      setErrorMessage(getErrorMessage(res.error, 'Failed to create order. Please try again.'));
      return;
    }

    router.push(ROUTES.orders.details(res.data.id));
  }

  return (
    <div className="d-grid gap-2">
      <button type="button" className={className ?? 'btn btn-success'} disabled={loading} onClick={handleClick}>
        {loading ? 'Creating order…' : 'Buy ticket'}
      </button>

      {errorMessage && <div className="alert alert-danger mb-0 py-2 small">{errorMessage}</div>}
    </div>
  );
}
