import type { Consumer } from 'nats';

import { parsePositiveInt, retry } from '@org/core';

import { getNats } from '../connection';
import { ensureDurableConsumer } from '../manager';
import type { Subject } from '../subjects';
import { sleep } from '../utils';

import type { CreatePullWorkerResult, PullWorkerEventHandler, PullWorkerOptions } from './types';
import { createMessageProcessor, createSemaphore } from './utils';

function getBootstrapRetryConfig() {
  const defaultAttempts = process.env.NODE_ENV === 'production' ? 0 : 60;
  const attempts = parsePositiveInt('NATS_TOPOLOGY_MAX_ATTEMPTS', defaultAttempts);

  return {
    delayMs: parsePositiveInt('NATS_TOPOLOGY_RETRY_DELAY_MS', 1000),
    maxAttempts: attempts === 0 ? undefined : attempts,
  };
}

function isRetryableBootstrapError(error: unknown): boolean {
  if (!error || typeof error !== 'object') {
    return false;
  }

  const code = 'code' in error ? error.code : undefined;
  const message = 'message' in error ? error.message : undefined;
  const apiError = 'api_error' in error ? error.api_error : undefined;
  const apiCode = apiError && typeof apiError === 'object' && 'code' in apiError ? apiError.code : undefined;
  const description =
    apiError && typeof apiError === 'object' && 'description' in apiError ? apiError.description : undefined;

  return (
    code === 'CONNECTION_REFUSED' ||
    code === 'ECONNREFUSED' ||
    code === 'TIMEOUT' ||
    apiCode === 503 ||
    (typeof message === 'string' &&
      (message.includes('stream not found') ||
        message.includes('consumer not found') ||
        message.includes('timeout') ||
        message.includes('ECONNREFUSED'))) ||
    (typeof description === 'string' &&
      (description.includes('stream not found') || description.includes('consumer not found')))
  );
}

export async function createPullWorker<TSubject extends Subject, TData>(
  opts: PullWorkerOptions<TSubject, TData>,
  handler: PullWorkerEventHandler<TData>,
  signal?: AbortSignal,
): Promise<CreatePullWorkerResult> {
  const { client, logger } = getNats();

  if (!opts.durable_name) {
    throw new Error('createPullWorker: provide durable_name');
  }

  const filterSubjects = opts.def?.subject ? [opts.def.subject] : (opts.filter_subjects ?? []);
  if (filterSubjects.length === 0) {
    throw new Error('createPullWorker: provide def or filter_subjects');
  }

  if (opts.ensure) {
    const retryConfig = getBootstrapRetryConfig();
    await retry(
      () =>
        ensureDurableConsumer({
          stream: opts.stream,
          durable_name: opts.durable_name,
          filter_subjects: filterSubjects,
          deliver_policy: opts.deliver_policy,
          ack_wait: opts.ack_wait,
          max_deliver: opts.max_deliver,
          max_ack_pending: opts.max_ack_pending,
          reconcile: 'warn',
        }),
      {
        label: `[nats] ensure consumer ${opts.stream}/${opts.durable_name}`,
        delayMs: retryConfig.delayMs,
        maxAttempts: retryConfig.maxAttempts,
        logger,
        shouldRetry: isRetryableBootstrapError,
      },
    );
  }

  const retryConfig = getBootstrapRetryConfig();
  const consumer: Consumer = await retry(() => client.consumers.get(opts.stream, opts.durable_name), {
    label: `[nats] get consumer ${opts.stream}/${opts.durable_name}`,
    delayMs: retryConfig.delayMs,
    maxAttempts: retryConfig.maxAttempts,
    logger,
    shouldRetry: isRetryableBootstrapError,
  });

  const batchSize = opts.batchSize ?? 50;
  const expiresMs = opts.expiresMs ?? 2000;
  const concurrency = Math.max(1, opts.concurrency ?? 8);

  const semaphore = createSemaphore(concurrency);

  const processMsg = createMessageProcessor({
    opts,
    handler,
    semaphore,
    logger,
  });

  let stopped = false;
  const stop = () => {
    stopped = true;
  };

  const abortListener = () => stop();
  signal?.addEventListener?.('abort', abortListener);

  const loop = async () => {
    while (!stopped && !signal?.aborted) {
      try {
        const messages = await consumer.fetch({ max_messages: batchSize, expires: expiresMs });

        const tasks: Promise<void>[] = [];

        for await (const msg of messages) {
          if (stopped || signal?.aborted) {
            break;
          }

          tasks.push(processMsg(msg)); // starts immediately (returns Promise)
        }

        // Wait for in-flight message handlers from this fetch cycle
        await Promise.allSettled(tasks);
      } catch (error) {
        logger.warn('[nats] fetch loop error; continuing', error);
        // small backoff to avoid tight loop on connection issues
        await sleep(250);
      }
    }
  };

  void loop().finally(() => {
    signal?.removeEventListener?.('abort', abortListener);
  });

  return { stop };
}
