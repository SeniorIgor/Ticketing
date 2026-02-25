'use client';

import { ErrorScreen } from '@/components';

export default function OrdersError({ reset }: { reset: () => void }) {
  return (
    <ErrorScreen title="Failed to load orders" message="There was a problem loading your orders." onRetry={reset} />
  );
}
