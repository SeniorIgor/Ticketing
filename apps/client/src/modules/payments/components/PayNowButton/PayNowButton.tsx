'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { useModal } from '@/components/Modal';

type PayNowButtonProps = {
  orderId: string;
  className?: string;
  redirectTo?: string;
};

export function PayNowButton({ orderId, className, redirectTo }: PayNowButtonProps) {
  const router = useRouter();
  const modal = useModal();
  const [loadingPaymentUi, setLoadingPaymentUi] = useState(false);

  return (
    <button
      className={className ?? 'btn btn-success'}
      type="button"
      disabled={loadingPaymentUi}
      onClick={async () => {
        if (loadingPaymentUi) {
          return;
        }

        setLoadingPaymentUi(true);

        try {
          const { StripePaymentModal } = await import('../StripePaymentModal/StripePaymentModal');

          modal.open(
            <StripePaymentModal
              orderId={orderId}
              onClose={modal.close}
              onSuccess={() => {
                modal.close();

                if (redirectTo) {
                  router.push(redirectTo);
                  return;
                }

                router.refresh();
              }}
            />,
            {
              title: 'Payment',
              size: 'md',
            },
          );
        } finally {
          setLoadingPaymentUi(false);
        }
      }}
    >
      {loadingPaymentUi ? 'Loading payment…' : 'Pay now'}
    </button>
  );
}
