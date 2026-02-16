import type { CreatePullWorkerResult } from '@org/nats';

import { startOrderCancelledListener } from './order-cancelled-listener';
import { startOrderCompletedListener } from './order-completed-listener';
import { startOrderCreatedListener } from './order-created-listener';

export async function startTicketsListeners(signal?: AbortSignal): Promise<CreatePullWorkerResult[]> {
  const workers: CreatePullWorkerResult[] = [];

  workers.push(await startOrderCreatedListener(signal));
  workers.push(await startOrderCompletedListener(signal));
  workers.push(await startOrderCancelledListener(signal));

  return workers;
}

export function stopWorkers(workers: CreatePullWorkerResult[]) {
  for (const worker of workers) {
    worker.stop();
  }
}
