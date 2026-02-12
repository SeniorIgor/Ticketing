import { createRedisConnections, envNumber, requireEnv } from '@org/queue';

export async function createExpirationRedis() {
  return createRedisConnections({
    host: requireEnv('REDIS_HOST'),
    port: envNumber('REDIS_PORT'),
    password: requireEnv('REDIS_PASSWORD'),
    maxRetriesPerRequest: null,
    enableReadyCheck: true,
  });
}
