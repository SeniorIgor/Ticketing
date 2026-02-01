export class RetryableError extends Error {
  constructor(message?: string) {
    super(message);
    this.name = 'RetryableError';
  }
}

export class NonRetryableError extends Error {
  constructor(message?: string) {
    super(message);
    this.name = 'NonRetryableError';
  }
}

export class PoisonMessageError extends NonRetryableError {
  constructor(message?: string) {
    super(message);
    this.name = 'PoisonMessageError';
  }
}

/** Default strategy: unknown errors are retryable. */
export function classifyError(err: unknown): 'retry' | 'term' {
  if (err instanceof NonRetryableError) {
    return 'term';
  }

  return 'retry';
}
