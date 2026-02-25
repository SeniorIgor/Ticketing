'use client';

import { ErrorScreen } from '@/components';

export default function PaymentDetailsError({ reset }: { reset: () => void }) {
  return (
    <ErrorScreen title="Failed to load payment" message="The payment receipt could not be loaded." onRetry={reset} />
  );
}
