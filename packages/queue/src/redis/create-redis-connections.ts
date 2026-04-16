import type IORedis from 'ioredis';

import { parsePositiveInt, retry } from '@org/core';

import { closeRedis, createRedis, waitRedisReady } from './create-redis';
import type { RedisConfig } from './redis-config';

export type RedisConnections = {
  client: IORedis;
  worker: IORedis;
  events: IORedis;
  close: () => Promise<void>;
};

type ErrorWithProps = {
  code?: unknown;
  message?: unknown;
  name?: unknown;
};

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function pickErrorProps(error: unknown): ErrorWithProps {
  if (!isObject(error)) {
    return {};
  }

  return {
    code: error.code,
    message: error.message,
    name: error.name,
  };
}

function asString(value: unknown): string | undefined {
  return typeof value === 'string' ? value : undefined;
}

function getRedisRetryConfig() {
  const defaultAttempts = process.env.NODE_ENV === 'production' ? 0 : 60;
  const attempts = parsePositiveInt('REDIS_CONNECT_MAX_ATTEMPTS', defaultAttempts);

  return {
    delayMs: parsePositiveInt('REDIS_CONNECT_RETRY_DELAY_MS', 1000),
    maxAttempts: attempts === 0 ? undefined : attempts,
  };
}

function isRetryableRedisError(error: unknown): boolean {
  const { code, message } = pickErrorProps(error);

  const codeStr = asString(code);
  const msgStr = asString(message);

  return (
    codeStr === 'ECONNREFUSED' ||
    codeStr === 'CONNECTION_REFUSED' ||
    codeStr === 'EAI_AGAIN' ||
    codeStr === 'ENOTFOUND' ||
    codeStr === 'TIMEOUT' ||
    (msgStr !== undefined &&
      (msgStr.includes('ECONNREFUSED') ||
        msgStr.includes('connection refused') ||
        msgStr.includes('Connection is closed') ||
        msgStr.includes('timeout') ||
        msgStr.includes('ETIMEDOUT')))
  );
}

function attachRedisEventLogs(name: string, redis: IORedis) {
  // IMPORTANT: without this, ioredis may crash the process on emitted "error"
  redis.on('error', (err: unknown) => {
    const { code, message, name: errName } = pickErrorProps(err);

    console.warn(`[redis:${name}] error`, {
      code: asString(code),
      name: asString(errName),
      message: asString(message),
    });
  });

  redis.on('connect', () => {
    console.info(`[redis:${name}] connect`);
  });

  redis.on('ready', () => {
    console.info(`[redis:${name}] ready`);
  });

  // ioredis docs: argument can be number; keep it flexible
  redis.on('reconnecting', (time: unknown) => {
    const inMs = typeof time === 'number' ? time : undefined;
    console.warn(`[redis:${name}] reconnecting`, { inMs });
  });

  redis.on('end', () => {
    console.warn(`[redis:${name}] end`);
  });

  redis.on('close', () => {
    console.warn(`[redis:${name}] close`);
  });
}

/**
 * Recommended: separate connections for producer / worker / events.
 * Keeps behavior predictable and avoids unexpected shared-connection issues.
 */
export async function createRedisConnections(config: RedisConfig): Promise<RedisConnections> {
  const retryConfig = getRedisRetryConfig();

  return retry(
    async () => {
      const client = createRedis(config);
      const worker = createRedis(config);
      const events = createRedis(config);

      // Attach listeners immediately (before any awaits)
      attachRedisEventLogs('client', client);
      attachRedisEventLogs('worker', worker);
      attachRedisEventLogs('events', events);

      try {
        await Promise.all([waitRedisReady(client), waitRedisReady(worker), waitRedisReady(events)]);

        return {
          client,
          worker,
          events,
          close: async () => {
            await Promise.all([closeRedis(client), closeRedis(worker), closeRedis(events)]);
          },
        };
      } catch (error) {
        await Promise.allSettled([closeRedis(client), closeRedis(worker), closeRedis(events)]);
        throw error;
      }
    },
    {
      label: '[redis] initial connection',
      delayMs: retryConfig.delayMs,
      maxAttempts: retryConfig.maxAttempts,
      shouldRetry: isRetryableRedisError,
      onRetry: (error, attempt) => {
        console.warn('[redis] initial connection failed; retrying', {
          attempt,
          delayMs: retryConfig.delayMs,
          error,
        });
      },
    },
  );
}
