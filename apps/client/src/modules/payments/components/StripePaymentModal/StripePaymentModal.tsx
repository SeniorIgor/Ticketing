'use client';

import { useMemo } from 'react';

import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

import { ModalFrame } from '@/components/Modal';
import { usePublicEnv } from '@/context';

import { CheckoutForm } from '../CheckoutForm/CheckoutForm';

type StripePaymentModalProps = {
  orderId: string;
  onClose: () => void;
  onSuccess?: () => void;
};

export function StripePaymentModal({ orderId, onClose, onSuccess }: StripePaymentModalProps) {
  const { stripePublishableKey } = usePublicEnv();

  const stripePromise = useMemo(() => loadStripe(stripePublishableKey), [stripePublishableKey]);

  return (
    <ModalFrame title="Payment" onClose={onClose} isBusy={false} size="md">
      <Elements stripe={stripePromise}>
        <CheckoutForm orderId={orderId} onClose={onClose} onSuccess={onSuccess} />
      </Elements>
    </ModalFrame>
  );
}
