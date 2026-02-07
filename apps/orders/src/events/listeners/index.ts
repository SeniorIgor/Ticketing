import type { CreatePullWorkerResult } from '@org/nats';

import { startTicketCreatedListener } from './ticket-created-listener';
import { startTicketUpdatedListener } from './ticket-updated-listener';

export async function startOrdersListeners(signal?: AbortSignal): Promise<CreatePullWorkerResult[]> {
  const workers: CreatePullWorkerResult[] = [];

  workers.push(await startTicketCreatedListener(signal));
  workers.push(await startTicketUpdatedListener(signal));

  return workers;
}

export function stopWorkers(workers: CreatePullWorkerResult[]) {
  for (const worker of workers) {
    worker.stop();
  }
}
