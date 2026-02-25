'use client';

import { ErrorScreen } from '@/components';

export default function NewTicketError({ reset }: { reset: () => void }) {
  return (
    <ErrorScreen
      title="Failed to open ticket form"
      message="There was a problem preparing the ticket creation page."
      onRetry={reset}
    />
  );
}
