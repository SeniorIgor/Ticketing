'use client';

import { useEffect, useMemo, useState } from 'react';

import { CardElement, useElements, useStripe } from '@stripe/react-stripe-js';
import type { StripeError } from '@stripe/stripe-js';

import { confirmPayment, createPaymentIntent } from '@/services/payments';
import { getErrorMessage } from '@/utils';

export type CheckoutStep = 'loading' | 'form' | 'success' | 'confirm_failed';

export function useCheckoutPayment(orderId: string) {
  const stripe = useStripe();
  const elements = useElements();

  const [step, setStep] = useState<CheckoutStep>('loading');
  const [submitting, setSubmitting] = useState(false);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [stripeError, setStripeError] = useState<StripeError | null>(null);

  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [confirmRequestId, setConfirmRequestId] = useState<string | undefined>(undefined);

  // Load clientSecret
  useEffect(() => {
    let alive = true;

    (async () => {
      setStep('loading');
      setErrorMessage(null);
      setStripeError(null);
      setConfirmRequestId(undefined);

      const res = await createPaymentIntent(orderId);

      if (!alive) {
        return;
      }

      if (!res.ok) {
        setErrorMessage(getErrorMessage(res.error, 'Failed to start payment. Please try again.'));
        setStep('form');
        return;
      }

      setClientSecret(res.data.clientSecret);
      setStep('form');
    })();

    return () => {
      alive = false;
    };
  }, [orderId]);

  const canPay = useMemo(() => {
    return !!stripe && !!elements && !!clientSecret && step === 'form' && !submitting;
  }, [stripe, elements, clientSecret, step, submitting]);

  async function pay() {
    if (!stripe || !elements || !clientSecret) {
      return;
    }

    const card = elements.getElement(CardElement);
    if (!card) {
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);
    setStripeError(null);
    setConfirmRequestId(undefined);

    const result = await stripe.confirmCardPayment(clientSecret, {
      payment_method: { card },
    });

    if (result.error) {
      setSubmitting(false);
      setStripeError(result.error);
      setErrorMessage(result.error.message ?? 'Payment failed. Please try again.');
      return;
    }

    const pi = result.paymentIntent;
    if (!pi || pi.status !== 'succeeded') {
      setSubmitting(false);
      setErrorMessage(`Payment did not succeed. Status=${pi?.status ?? 'unknown'}`);
      return;
    }

    const confirmRes = await confirmPayment(orderId, pi.id);

    if (!confirmRes.ok) {
      setSubmitting(false);
      setConfirmRequestId(confirmRes.error.requestId);
      setErrorMessage(
        getErrorMessage(
          confirmRes.error,
          'Payment succeeded, but confirmation failed. Please refresh and check the order status.',
        ),
      );
      setStep('confirm_failed');
      return;
    }

    setSubmitting(false);
    setStep('success');
  }

  function resetToForm() {
    setStep('form');
    setErrorMessage(null);
    setStripeError(null);
    setConfirmRequestId(undefined);
  }

  return {
    stripe,
    elements,
    step,
    submitting,
    canPay,

    errorMessage,
    stripeError,
    confirmRequestId,

    pay,
    resetToForm,
  };
}
