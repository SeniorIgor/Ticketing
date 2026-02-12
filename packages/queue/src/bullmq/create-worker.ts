import type { Processor, WorkerOptions } from 'bullmq';
import { Worker } from 'bullmq';

import type { QueueNamespaced, QueueRedisConnections } from './types';

type WorkerOptionsWithoutConnection = Omit<WorkerOptions, 'connection' | 'prefix'>;

interface CreateWorkerDeps {
  redis: QueueRedisConnections;
  namespace?: QueueNamespaced;
  workerOptions?: WorkerOptionsWithoutConnection;
}

export function createWorker<TData = unknown, TResult = unknown>(
  name: string,
  processor: Processor<TData, TResult>,
  { redis, namespace, workerOptions }: CreateWorkerDeps,
) {
  return new Worker<TData, TResult>(name, processor, {
    ...workerOptions,
    connection: redis.worker,
    prefix: namespace?.prefix,
  });
}
