import type { JobsOptions, Queue } from 'bullmq';

import { ExpirationJobName, type ExpireOrderJobData } from './expiration.schema';

interface ScheduleExpirationParams {
  queue: Queue;
  orderId: string;
  expiresAt: string | Date;
  correlationId?: string;
}

export async function scheduleExpiration({ orderId, expiresAt, queue, correlationId }: ScheduleExpirationParams) {
  const delay = Math.max(0, new Date(expiresAt).getTime() - Date.now());

  // idempotency
  const existing = await queue.getJob(orderId);
  if (existing) {
    return;
  }

  const opts: JobsOptions = { jobId: orderId, delay };

  const data: ExpireOrderJobData = { orderId: orderId, correlationId };

  try {
    await queue.add(ExpirationJobName.ExpireOrder, data, opts);
  } catch (err) {
    // Handle race: job may have been added by another instance
    const after = await queue.getJob(orderId);
    if (after) {
      return;
    }

    throw err;
  }
}
