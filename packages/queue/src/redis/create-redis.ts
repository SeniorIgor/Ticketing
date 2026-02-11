import IORedis from 'ioredis';

import type { RedisConfig } from './redis-config';

export function createRedis(config: RedisConfig): IORedis {
  return new IORedis({
    host: config.host,
    port: config.port,
    password: config.password,
    db: config.db,
    maxRetriesPerRequest: config.maxRetriesPerRequest ?? null,
    enableReadyCheck: config.enableReadyCheck ?? true,
  });
}

export async function waitRedisReady(redis: IORedis): Promise<void> {
  if (redis.status === 'ready') {
    return;
  }

  await new Promise<void>((resolve, reject) => {
    const onReady = () => {
      cleanup();
      resolve();
    };

    const onError = (err: unknown) => {
      cleanup();
      reject(err);
    };

    const cleanup = () => {
      redis.off('ready', onReady);
      redis.off('error', onError);
    };

    redis.once('ready', onReady);
    redis.once('error', onError);
  });
}

export async function closeRedis(redis: IORedis): Promise<void> {
  // quit() allows in-flight commands to complete
  await redis.quit().catch(() => redis.disconnect());
}
