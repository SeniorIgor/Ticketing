import type { Logger } from '@org/core';

import { sleep } from './sleep';

export interface RetryOptions {
  label: string;
  delayMs: number;
  maxAttempts?: number;
  logger?: Logger;
  shouldRetry?: (error: unknown) => boolean;
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

      options.logger?.warn(`${options.label} failed; retrying`, {
        attempt,
        delayMs: options.delayMs,
        error,
      });

      await sleep(options.delayMs);
    }
  }
}
