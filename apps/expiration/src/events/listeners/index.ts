import type { CreatePullWorkerResult } from '@org/nats';

import type { ExpirationQueue } from '../../queues';

import { startOrderCreatedListener } from './order-created-listener';

interface StartExpirationListenersDeps {
  queue: ExpirationQueue;
}

export async function startExpirationListeners(
  deps: StartExpirationListenersDeps,
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
