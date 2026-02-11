import { QueueEvents } from 'bullmq';

import type { QueueNamespaced, QueueRedisConnections } from './types';

interface CreateQueueEventsDeps {
  redis: QueueRedisConnections;
  namespace?: QueueNamespaced;
}

export function createQueueEvents(name: string, { redis, namespace }: CreateQueueEventsDeps) {
  return new QueueEvents(name, {
    connection: redis.events,
    prefix: namespace?.prefix,
  });
}
