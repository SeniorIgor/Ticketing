import type IORedis from 'ioredis';

import { closeRedis, createRedis, waitRedisReady } from './create-redis';
import type { RedisConfig } from './redis-config';

export type RedisConnections = {
  client: IORedis;
  worker: IORedis;
  events: IORedis;
  close: () => Promise<void>;
};

/**
 * Recommended: separate connections for producer / worker / events.
 * Keeps behavior predictable and avoids unexpected shared-connection issues.
 */
export async function createRedisConnections(config: RedisConfig): Promise<RedisConnections> {
  const client = createRedis(config);
  const worker = createRedis(config);
  const events = createRedis(config);

  // Fail fast on DNS/creds problems
  await Promise.all([waitRedisReady(client), waitRedisReady(worker), waitRedisReady(events)]);

  return {
    client,
    worker,
    events,
    close: async () => {
      await Promise.all([closeRedis(client), closeRedis(worker), closeRedis(events)]);
    },
  };
}
