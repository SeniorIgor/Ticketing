import type { Consumer } from 'nats';

import { ensureDurableConsumer } from '../admin';
import { getNats } from '../client/connection';
import { sleep } from '../utils';

import type { CreatePullWorkerResult, PullWorkerEventHandler, PullWorkerOptions } from './types';
import { createMessageProcessor, createSemaphore } from './utils';

export async function createPullWorker<TSubject extends string, TData>(
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
    await ensureDurableConsumer({
      stream: opts.stream,
      durable_name: opts.durable_name,
      filter_subjects: filterSubjects,
      deliver_policy: opts.deliver_policy,
      ack_wait: opts.ack_wait,
      max_deliver: opts.max_deliver,
      max_ack_pending: opts.max_ack_pending,
      reconcile: 'warn',
    });
  }

  const consumer: Consumer = await client.consumers.get(opts.stream, opts.durable_name);

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
