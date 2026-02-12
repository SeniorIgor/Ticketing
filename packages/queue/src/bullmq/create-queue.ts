import type { JobsOptions } from 'bullmq';
import { Queue } from 'bullmq';

import type { QueueNamespaced, QueueRedisConnections } from './types';

interface CreateQueueDeps {
  redis: QueueRedisConnections;
  namespace?: QueueNamespaced;
  defaultJobOptions?: JobsOptions;
}

export function createQueue<TData = unknown, TResult = unknown, TName extends string = string>(
  name: string,
  { redis, namespace, defaultJobOptions }: CreateQueueDeps,
) {
  return new Queue<TData, TResult, TName>(name, {
    connection: redis.client,
    prefix: namespace?.prefix,
    defaultJobOptions,
  });
}
