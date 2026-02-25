'use client';

import { ErrorScreen } from '@/components';

export default function OrderDetailsError({ reset }: { reset: () => void }) {
  return <ErrorScreen title="Failed to load order" message="The order could not be loaded." onRetry={reset} />;
}
