'use client';

import { useEffect } from 'react';

import { ErrorScreen } from '@/components';

type GlobalErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

const isDev = process.env.NODE_ENV === 'development';

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    // Log to console (dev)
    console.error('Global error boundary:', error);
    // Later you can integrate:
    // Sentry.captureException(error);
  }, [error]);

  return (
    <ErrorScreen
      title="Unexpected error"
      message={isDev ? error.message : 'An unexpected error occurred. Please try again.'}
      onRetry={reset}
    />
  );
}
