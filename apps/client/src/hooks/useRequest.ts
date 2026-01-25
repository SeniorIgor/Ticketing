import { useState } from 'react';

import type { BackendError, HttpError, Result } from '@/http';

export function useRequest() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<BackendError | null>(null);

  async function run<TData>(fn: () => Promise<Result<TData, HttpError>>): Promise<Result<TData, HttpError>> {
    setLoading(true);
    setError(null);

    const result = await fn();

    if (!result.ok) {
      setError(result.error.payload as BackendError);
      setLoading(false);
      return result;
    }

    setLoading(false);
    return result;
  }

  return {
    loading,
    error,
    run,
    resetError: () => setError(null),
  };
}
