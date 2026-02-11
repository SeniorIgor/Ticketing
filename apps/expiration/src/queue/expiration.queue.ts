import type { Queue, QueueEvents, Worker } from 'bullmq';

import { OrderExpiredEvent } from '@org/contracts';
import { createLogger } from '@org/core';
import { publishEvent } from '@org/nats';
import type { QueueNamespaced, RedisConnections } from '@org/queue';
import { createQueue, createQueueEvents, createWorker, defaultJobOptionsFromEnv } from '@org/queue';

import { ExpireOrderJob, type ExpireOrderJobData } from './expiration.schema';

export const EXPIRATION_QUEUE_NAME = 'expiration';

interface CreateExpirationQueueDeps {
  redis: RedisConnections;
  prefix?: string;
  workerConcurrency?: number;
}

export function createExpirationQueue({ redis, prefix, workerConcurrency }: CreateExpirationQueueDeps) {
  const logger = createLogger();
  const namespace: QueueNamespaced = { prefix };

  const queue: Queue = createQueue(EXPIRATION_QUEUE_NAME, {
    redis,
    namespace,
    defaultJobOptions: defaultJobOptionsFromEnv('EXPIRATION'),
  });

  const events: QueueEvents = createQueueEvents(EXPIRATION_QUEUE_NAME, {
    redis,
    namespace,
  });

  const worker: Worker<ExpireOrderJobData> = createWorker<ExpireOrderJobData>(
    EXPIRATION_QUEUE_NAME,
    async (job) => {
      const { orderId, correlationId } = ExpireOrderJob.parse(job.data);

      await publishEvent(OrderExpiredEvent, { orderId }, { correlationId });

      logger.info('[expiration] OrderExpired published', {
        orderId,
        jobId: job.id,
      });
    },
    {
      redis,
      namespace,
      workerOptions: { concurrency: workerConcurrency ?? 8 },
    },
  );

  worker.on('failed', (job, err) => {
    logger.error('[expiration] job failed', { jobId: job?.id, err });
  });

  worker.on('error', (err) => {
    logger.error('[expiration] worker error', { err });
  });

  return { queue, worker, events };
}
