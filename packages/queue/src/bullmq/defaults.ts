import type { JobsOptions, WorkerOptions } from 'bullmq';

export function defaultJobOptionsFromEnv(prefix = 'QUEUE'): JobsOptions {
  const attempts = Number(process.env[`${prefix}_JOB_ATTEMPTS`] ?? '10');
  const backoffDelay = Number(process.env[`${prefix}_JOB_BACKOFF_MS`] ?? '1000');
  const removeOnComplete = Number(process.env[`${prefix}_REMOVE_ON_COMPLETE`] ?? '5000');
  const removeOnFail = Number(process.env[`${prefix}_REMOVE_ON_FAIL`] ?? '5000');

  return {
    attempts,
    backoff: { type: 'exponential', delay: backoffDelay },
    removeOnComplete: { count: removeOnComplete },
    removeOnFail: { count: removeOnFail },
  };
}

export function defaultWorkerOptionsFromEnv(prefix = 'QUEUE'): Pick<WorkerOptions, 'concurrency'> {
  const concurrency = Number(process.env[`${prefix}_WORKER_CONCURRENCY`] ?? '8');
  return { concurrency };
}
