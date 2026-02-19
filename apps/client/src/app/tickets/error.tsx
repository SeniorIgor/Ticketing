'use client';

import { ErrorScreen } from '@/components';

export default function TicketsError({ reset }: { reset: () => void }) {
  return (
    <ErrorScreen
      title="Failed to load tickets"
      message="There was a problem loading ticket listings."
      onRetry={reset}
    />
  );
}
