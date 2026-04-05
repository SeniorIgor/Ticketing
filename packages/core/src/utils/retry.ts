import type { Logger } from './logger';

export interface RetryOptions {
  label: string;
  delayMs: number;
  maxAttempts?: number;
  logger?: Logger;
  shouldRetry?: (error: unknown) => boolean;
  onRetry?: (error: unknown, attempt: number) => void;
}

export async function retry<T>(operation: () => Promise<T>, options: RetryOptions): Promise<T> {
  let attempt = 0;

  while (true) {
    try {
      return await operation();
    } catch (error) {
      attempt += 1;

      if (options.shouldRetry && !options.shouldRetry(error)) {
        throw error;
      }

      if (options.maxAttempts !== undefined && attempt >= options.maxAttempts) {
        throw error;
      }

      options.onRetry?.(error, attempt);

      options.logger?.warn(`${options.label} failed; retrying`, {
        attempt,
        delayMs: options.delayMs,
        error,
      });

      await new Promise((resolve) => setTimeout(resolve, options.delayMs));
    }
  }
}
