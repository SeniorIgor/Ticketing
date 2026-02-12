import { createExpirationQueue } from './expiration.queue';
import { createExpirationRedis } from './redis';
import type { ExpirationQueue } from './types';

export type ExpirationWorkerResult = {
  queue: ExpirationQueue;
  shutdown: () => Promise<void>;
};

export async function startExpirationWorker(signal?: AbortSignal): Promise<ExpirationWorkerResult> {
  const redis = await createExpirationRedis();

  const { queue, worker, events } = createExpirationQueue({
    redis,
    prefix: process.env.REDIS_PREFIX,
    workerConcurrency: Number(process.env.EXPIRATION_WORKER_CONCURRENCY ?? '8'),
  });

  const shutdown = async () => {
    await worker.close();
    await events.close();
    await queue.close();
    await redis.close();
  };

  signal?.addEventListener('abort', () => {
    void shutdown();
  });

  return { queue, shutdown };
}
