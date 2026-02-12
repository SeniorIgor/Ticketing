import type { JobsOptions } from 'bullmq';

import { ExpirationJobName, type ExpireOrderJobData } from './expiration.schema';
import type { ExpirationQueue } from './types';

interface ScheduleExpirationParams {
  queue: ExpirationQueue;
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
  const data: ExpireOrderJobData = { orderId, correlationId };

  try {
    await queue.add(ExpirationJobName.ExpireOrder, data, opts);
  } catch (err) {
    const after = await queue.getJob(orderId);
    if (after) {
      return;
    }

    throw err;
  }
}
