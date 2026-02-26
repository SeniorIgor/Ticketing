'use client';

import { useRouter } from 'next/navigation';

import { useModal } from '@/components/Modal';

import { StripePaymentModal } from '../StripePaymentModal/StripePaymentModal';

type PayNowButtonProps = {
  orderId: string;
  className?: string;
  redirectTo?: string;
};

export function PayNowButton({ orderId, className, redirectTo }: PayNowButtonProps) {
  const router = useRouter();
  const modal = useModal();

  return (
    <button
      className={className ?? 'btn btn-success'}
      type="button"
      onClick={() => {
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
        );
      }}
    >
      Pay now
    </button>
  );
}
