import type IORedis from 'ioredis';

export type QueueRedisConnections = {
  client: IORedis;
  worker: IORedis;
  events: IORedis;
};

export type QueueNamespaced = {
  /**
   * Optional prefix for redis keys (useful in shared redis)
   * Example: "ticketing"
   */
  prefix?: string;
};
