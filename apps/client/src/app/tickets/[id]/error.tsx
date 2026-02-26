'use client';

import { ErrorScreen } from '@/components';

export default function TicketDetailsError({ reset }: { reset: () => void }) {
  return <ErrorScreen title="Failed to load ticket" message="The ticket could not be loaded." onRetry={reset} />;
}
