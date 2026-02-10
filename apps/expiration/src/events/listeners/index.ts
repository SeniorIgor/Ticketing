import type { CreatePullWorkerResult } from '@org/nats';

export async function startExpirationListeners(_signal?: AbortSignal): Promise<CreatePullWorkerResult[]> {
  const workers: CreatePullWorkerResult[] = [];

  // workers.push(await startTicketCreatedListener(signal));
  // workers.push(await startTicketUpdatedListener(signal));

  return workers;
}

export function stopWorkers(workers: CreatePullWorkerResult[]) {
  for (const worker of workers) {
    worker.stop();
  }
}
