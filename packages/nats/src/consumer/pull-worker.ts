/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Consumer, DeliverPolicy } from 'nats';
import { StringCodec } from 'nats';

import { ensureDurableConsumer } from '../admin/consumers';
import { decodeJson } from '../codec';
import { getNats } from '../connection';
import { publishDeadLetter } from '../dlq/dlq';
import type { DeadLetterRecord } from '../dlq/types';
import type { EventDef, EventEnvelope } from '../envelope';
import { getHeader, HDR } from '../observability/headers';

import { classifyError, PoisonMessageError } from './errors';
import type { EventHandler, MessageContext } from './handler';

type PullWorkerOptions<TSubject extends string, TData> = {
  stream: string;
  consumer: string; // durable name ("group")
  def?: EventDef<TSubject, TData>; // recommended
  filterSubjects?: string[]; // optional advanced use

  // fetch tuning
  batchSize?: number;
  expiresMs?: number;

  // concurrency
  concurrency?: number;

  // consumer config (only applied if ensure=true)
  ensure?: boolean;
  deliverPolicy?: DeliverPolicy;
  ackWaitNs?: number;
  maxDeliver?: number;
  maxAckPending?: number;

  // DLQ + invalid payload behavior
  deadLetterSubject?: string; // e.g. "dlq.events"
  termInvalid?: boolean; // default true
  loggerName?: string;
};

function semaphore(limit: number) {
  let active = 0;
  const queue: Array<() => void> = [];
  const acquire = async () => {
    if (active < limit) {
      active++;
      return;
    }
    await new Promise<void>((res) => queue.push(res));
    active++;
  };
  const release = () => {
    active--;
    const next = queue.shift();
    if (next) {
      next();
    }
  };
  return { acquire, release };
}

const codec = StringCodec();

export async function createPullWorker<TSubject extends string, TData>(
  opts: PullWorkerOptions<TSubject, TData>,
  handler: EventHandler<TData>,
  signal?: AbortSignal,
): Promise<{ stop: () => void }> {
  const { client, logger } = getNats();

  const filterSubjects = opts.def?.subject ? [opts.def.subject] : (opts.filterSubjects ?? []);

  if (filterSubjects.length === 0) {
    throw new Error('createPullWorker: provide def or filterSubjects');
  }

  if (opts.ensure) {
    await ensureDurableConsumer({
      stream: opts.stream,
      durable: opts.consumer,
      filterSubjects,
      deliverPolicy: opts.deliverPolicy,
      ackWaitNs: opts.ackWaitNs,
      maxDeliver: opts.maxDeliver,
      maxAckPending: opts.maxAckPending,
      reconcile: 'warn',
    });
  }

  const consumer: Consumer = await client.consumers.get(opts.stream, opts.consumer);

  const batchSize = opts.batchSize ?? 50;
  const expiresMs = opts.expiresMs ?? 2000;
  const concurrency = Math.max(1, opts.concurrency ?? 8);

  const sem = semaphore(concurrency);

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

          const task = (async () => {
            await sem.acquire();

            try {
              const subject = msg.subject;

              const delivered = (msg.info as any)?.delivered ?? undefined;
              const seq = (msg.info as any)?.streamSequence ?? (msg.info as any)?.stream_seq ?? undefined;

              const correlationId = getHeader(msg.headers, HDR.correlationId);
              const causationId = getHeader(msg.headers, HDR.causationId);
              const traceparent = getHeader(msg.headers, HDR.traceparent);

              // decode envelope
              const env = decodeJson<EventEnvelope<unknown>>(msg.data);

              // Validate envelope minimum + data schema
              if (opts.def) {
                if (env.subject !== opts.def.subject) {
                  throw new PoisonMessageError(`Unexpected subject: ${env.subject}`);
                }

                if (env.type !== opts.def.type || env.version !== opts.def.version) {
                  // allow you to later build multi-version routing; for now term + DLQ
                  throw new PoisonMessageError(`Unexpected event type/version: ${env.type}@${env.version}`);
                }

                const parsedData = opts.def.schema.safeParse(env.data);
                if (!parsedData.success) {
                  throw new PoisonMessageError(parsedData.error.message);
                }

                const context: MessageContext = {
                  stream: opts.stream,
                  consumer: opts.consumer,
                  subject,
                  seq,
                  delivered,
                  correlationId,
                  causationId,
                  traceparent,
                  headers: msg.headers,
                };

                await handler(parsedData.data, context);
                msg.ack();
                return;
              }

              // If no def provided (advanced): just pass raw decoded data
              const context: MessageContext = {
                stream: opts.stream,
                consumer: opts.consumer,
                subject,
                seq,
                delivered,
                correlationId,
                causationId,
                traceparent,
                headers: msg.headers,
              };

              await handler(env.data as TData, context);
              msg.ack();
            } catch (err) {
              const mode = classifyError(err);

              if (opts.deadLetterSubject) {
                const headers: Record<string, string> = {};

                if (msg.headers) {
                  for (const key of msg.headers.keys()) {
                    const value = msg.headers.get(key);

                    if (value !== null) {
                      headers[key] = value;
                    }
                  }
                }

                const rec: DeadLetterRecord = {
                  originalSubject: msg.subject,
                  stream: opts.stream,
                  consumer: opts.consumer,
                  seq: (msg.info as any)?.streamSequence,
                  delivered: (msg.info as any)?.delivered,
                  error: err instanceof Error ? err.message : String(err),
                  raw: safeDecodeRaw(msg.data),
                  headers: Object.keys(headers).length ? headers : undefined,
                  at: new Date().toISOString(),
                };

                try {
                  await publishDeadLetter(opts.deadLetterSubject, rec);
                } catch (dlqErr) {
                  logger.error('[nats] dlq publish failed', dlqErr);
                }
              }

              if (mode === 'term') {
                // Stop redelivery. (If you DLQ, this is usually what you want.)
                msg.term();
              } else {
                // Request retry (respects consumer backoff/max_deliver)
                msg.nak();
              }
            } finally {
              sem.release();
            }
          })();

          tasks.push(task);
        }

        // Wait for in-flight message handlers from this fetch cycle
        await Promise.allSettled(tasks);
      } catch (e) {
        logger.warn('[nats] fetch loop error; continuing', e);
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

function safeDecodeRaw(data: Uint8Array): string {
  try {
    return codec.decode(data);
  } catch {
    return '[un-decodable-bytes]';
  }
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
