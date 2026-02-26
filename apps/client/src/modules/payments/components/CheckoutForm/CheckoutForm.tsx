'use client';

import { CardElement } from '@stripe/react-stripe-js';

import { PaymentErrorHint } from '../PaymentErrorHint/PaymentErrorHint';
import { PaymentResult } from '../PaymentResult/PaymentResult';

import { useCheckoutPayment } from './CheckoutForm.hooks';

export function CheckoutForm({
  orderId,
  onClose,
  onSuccess,
}: {
  orderId: string;
  onClose: () => void;
  onSuccess?: () => void;
}) {
  const { step, submitting, canPay, errorMessage, stripeError, confirmRequestId, pay, resetToForm } =
    useCheckoutPayment(orderId);

  if (step === 'success') {
    return (
      <PaymentResult
        variant="success"
        title="Payment successful"
        description="Your order has been paid."
        actions={
          <>
            <button
              type="button"
              className="btn btn-success"
              onClick={() => {
                onSuccess?.();
                onClose();
              }}
            >
              Close
            </button>
          </>
        }
      />
    );
  }

  if (step === 'confirm_failed') {
    return (
      <PaymentResult
        variant="warning"
        title="Payment received, but confirmation failed"
        description={errorMessage ?? 'Please refresh and check the order status.'}
        requestId={confirmRequestId}
        actions={
          <>
            <button type="button" className="btn btn-primary" onClick={() => window.location.reload()}>
              Refresh page
            </button>
            <button type="button" className="btn btn-outline-secondary" onClick={resetToForm} disabled={submitting}>
              Back
            </button>
            <button type="button" className="btn btn-outline-secondary" onClick={onClose} disabled={submitting}>
              Close
            </button>
          </>
        }
      />
    );
  }

  return (
    <div className="card-body p-4">
      <div className="d-flex justify-content-between align-items-center">
        <div>
          <div className="fw-semibold">Pay with card</div>
          <div className="text-muted small">Secure payment powered by Stripe</div>
        </div>

        <button type="button" className="btn btn-sm btn-outline-secondary" onClick={onClose} disabled={submitting}>
          Close
        </button>
      </div>

      <hr className="my-3" />

      {step === 'loading' ? (
        <div className="text-muted">Preparing checkout…</div>
      ) : (
        <div className="d-grid gap-3">
          <div className="border rounded-3 p-3 bg-white">
            <CardElement options={{ hidePostalCode: true }} />
          </div>

          <button type="button" className="btn btn-success" onClick={pay} disabled={!canPay}>
            {submitting ? 'Processing…' : 'Pay now'}
          </button>

          {/* Stripe-specific hint (optional but nice) */}
          <PaymentErrorHint error={stripeError ?? undefined} />

          {/* Generic error message */}
          {errorMessage && <div className="alert alert-danger mb-0 py-2 small">{errorMessage}</div>}

          <div className="text-muted small">Test card: 4242 4242 4242 4242 · any future date · any CVC</div>
        </div>
      )}
    </div>
  );
}
