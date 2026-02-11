import type { Queue } from 'bullmq';

import type { CreatePullWorkerResult } from '@org/nats';

import { startOrderCreatedListener } from './order-created-listener';

export async function startExpirationListeners(
  deps: { queue: Queue },
  signal?: AbortSignal,
): Promise<CreatePullWorkerResult[]> {
  const workers: CreatePullWorkerResult[] = [];

  workers.push(await startOrderCreatedListener(deps, signal));

  return workers;
}

export function stopWorkers(workers: CreatePullWorkerResult[]) {
  for (const worker of workers) {
    worker.stop();
  }
}
