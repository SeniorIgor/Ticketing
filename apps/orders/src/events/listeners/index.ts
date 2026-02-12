import type { CreatePullWorkerResult } from '@org/nats';

import { startOrderExpiredListener } from './order-expired-listener';
import { startTicketCreatedListener } from './ticket-created-listener';
import { startTicketUpdatedListener } from './ticket-updated-listener';

export async function startOrdersListeners(signal?: AbortSignal): Promise<CreatePullWorkerResult[]> {
  const workers: CreatePullWorkerResult[] = [];

  workers.push(await startTicketCreatedListener(signal));
  workers.push(await startTicketUpdatedListener(signal));
  workers.push(await startOrderExpiredListener(signal));

  return workers;
}

export function stopWorkers(workers: CreatePullWorkerResult[]) {
  for (const worker of workers) {
    worker.stop();
  }
}
