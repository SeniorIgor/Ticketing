'use client';

import { ErrorScreen } from '@/components';

export default function MyTicketsError({ reset }: { reset: () => void }) {
  return (
    <ErrorScreen
      title="Failed to load your tickets"
      message="There was a problem loading tickets you created."
      onRetry={reset}
    />
  );
}
