'use client';

import { ErrorScreen } from '@/components';

export default function PaymentsError({ reset }: { reset: () => void }) {
  return (
    <ErrorScreen
      title="Failed to load payments"
      message="There was a problem loading your payment history."
      onRetry={reset}
    />
  );
}
