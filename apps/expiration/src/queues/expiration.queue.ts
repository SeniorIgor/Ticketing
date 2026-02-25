import { OrderExpiredEvent } from '@org/contracts';
import { getNats, publishEvent } from '@org/nats';
import type { QueueNamespaced, RedisConnections } from '@org/queue';
import { createQueue, createQueueEvents, createWorker, defaultJobOptionsFromEnv } from '@org/queue';

import type { ExpirationJobName, ExpireOrderJobData } from './expiration.schema';
import { ExpireOrderJob } from './expiration.schema';

export const EXPIRATION_QUEUE_NAME = 'expiration';

interface CreateExpirationQueueDeps {
  redis: RedisConnections;
  prefix?: string;
  workerConcurrency?: number;
}

export function createExpirationQueue({ redis, prefix, workerConcurrency }: CreateExpirationQueueDeps) {
  const { logger } = getNats();
  const namespace: QueueNamespaced = { prefix };

  const queue = createQueue<ExpireOrderJobData, void, ExpirationJobName>(EXPIRATION_QUEUE_NAME, {
    redis,
    namespace,
    defaultJobOptions: defaultJobOptionsFromEnv('EXPIRATION'),
  });

  const events = createQueueEvents(EXPIRATION_QUEUE_NAME, {
    redis,
    namespace,
  });

  const worker = createWorker<ExpireOrderJobData>(
    EXPIRATION_QUEUE_NAME,
    async (job) => {
      const { orderId, correlationId } = ExpireOrderJob.parse(job.data);

      await publishEvent(OrderExpiredEvent, { orderId }, { correlationId });

      logger.info('[expiration] OrderExpired published', { orderId, jobId: job.id });
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
