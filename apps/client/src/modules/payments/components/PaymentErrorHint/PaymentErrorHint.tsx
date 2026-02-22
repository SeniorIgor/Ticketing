'use client';

type StripeLikeError = {
  message?: string;
  code?: string;
  decline_code?: string;
  type?: string;
};

function buildHint(err?: StripeLikeError | null): string | null {
  if (!err) {
    return null;
  }

  // Stripe.js commonly gives `error.type`, `error.code`, `error.decline_code`
  // We keep it lightweight and friendly.
  if (err.code === 'card_declined' || err.decline_code === 'insufficient_funds') {
    return 'Your bank declined the payment. Try a different card or contact your bank.';
  }

  if (err.code === 'expired_card') {
    return 'This card is expired. Please try another card.';
  }

  if (err.code === 'incorrect_cvc') {
    return 'The CVC code seems incorrect. Please check and try again.';
  }

  if (err.code === 'processing_error') {
    return 'Stripe had a temporary processing issue. Please try again in a moment.';
  }

  if (err.code === 'authentication_required') {
    return 'Your bank requires additional authentication (3D Secure). Please try again.';
  }

  // fallback: show original message if present
  return err.message ?? null;
}

export function PaymentErrorHint({ error }: { error?: StripeLikeError | null }) {
  const hint = buildHint(error);
  if (!hint) {
    return null;
  }

  return <div className="alert alert-warning mb-0 py-2 small">{hint}</div>;
}
