import type { JsMsg } from 'nats';

import { buildDeadLetterRecord, publishDeadLetter } from '../../dlq';
import type { EventEnvelope } from '../../envelope';
import { decodeJson } from '../../utils/codec';
import type { Logger } from '../../utils/logger';
import { classifyError, PoisonMessageError } from '../errors';
import type { PullWorkerEventHandler, PullWorkerOptions } from '../types';

import type { Semaphore } from '.';
import { buildContext } from '.';

interface CreateMessageProcessorParams<TSubject extends string, TData> {
  opts: PullWorkerOptions<TSubject, TData>;
  handler: PullWorkerEventHandler<TData>;
  semaphore: Semaphore;
  logger: Logger;
}

export function createMessageProcessor<TSubject extends string, TData>({
  opts,
  handler,
  semaphore,
  logger,
}: CreateMessageProcessorParams<TSubject, TData>) {
  return async function processMsg(msg: JsMsg): Promise<void> {
    await semaphore.acquire();

    try {
      const context = buildContext({
        stream: opts.stream,
        durable_name: opts.durable_name,
        subject: msg.subject,
        headers: msg.headers,
        msg,
      });

      const env = decodeJson<EventEnvelope<unknown>>(msg.data);

      if (opts.def) {
        if (env.subject !== opts.def.subject) {
          throw new PoisonMessageError(`Unexpected subject: ${env.subject}`);
        }
        if (env.type !== opts.def.type || env.version !== opts.def.version) {
          throw new PoisonMessageError(`Unexpected event type/version: ${env.type}@${env.version}`);
        }

        const parsed = opts.def.schema.safeParse(env.data);
        if (!parsed.success) {
          throw new PoisonMessageError(parsed.error.message);
        }

        await handler(parsed.data, context);
        msg.ack();
        return;
      }

      // Advanced escape hatch: no contract validation
      await handler(env.data as TData, context);
      msg.ack();
    } catch (error) {
      const mode = classifyError(error);

      if (opts.deadLetterSubject) {
        const record = buildDeadLetterRecord({
          msg,
          stream: opts.stream,
          durable_name: opts.durable_name,
          error,
        });

        try {
          await publishDeadLetter(opts.deadLetterSubject, record);
        } catch (dlqErr) {
          logger.error('[nats] dlq publish failed', dlqErr);
        }
      }

      const isPoison = error instanceof PoisonMessageError;
      const termInvalid = opts.termInvalid ?? true;

      if (mode === 'term' && (!isPoison || termInvalid)) {
        msg.term();
      } else {
        msg.nak();
      }
    } finally {
      semaphore.release();
    }
  };
}
