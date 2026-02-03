import type { JsMsg } from 'nats';

import { buildDeadLetterRecord, publishDeadLetter } from '../../dlq';
import { EventEnvelopeSchema } from '../../envelope';
import { getSchemaForVersion } from '../../event-def';
import { decodeJson } from '../../utils/codec';
import type { Logger } from '../../utils/logger';
import { classifyError, PoisonMessageError } from '../errors';
import type { PullWorkerEventHandler, PullWorkerOptions } from '../types';

import type { Semaphore } from '.';
import { buildContext } from '.';

interface CreateMessageProcessorParams<TSubject extends string, TData> {
  opts: PullWorkerOptions<TSubject>;
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

      const raw = decodeJson<unknown>(msg.data);
      const envParsed = EventEnvelopeSchema.safeParse(raw);

      if (!envParsed.success) {
        throw new PoisonMessageError(envParsed.error.message);
      }

      const env = envParsed.data;

      // If no def: escape hatch (no contract validation)
      if (!opts.def && !opts.schemaByVersion) {
        await handler(env.data as TData, context);

        msg.ack();
        return;
      }

      // Validate subject/type if def provided
      if (opts.def) {
        if (env.subject !== opts.def.subject) {
          throw new PoisonMessageError(`Unexpected subject: ${env.subject}`);
        }

        if (env.type !== opts.def.type) {
          throw new PoisonMessageError(`Unexpected event type: ${env.type}`);
        }
      }

      const allowedVersions = opts.acceptVersions;

      // Determine schema
      const schema =
        opts.schemaByVersion?.[env.version] ?? (opts.def ? getSchemaForVersion(opts.def, env.version) : undefined);

      if (!schema) {
        throw new PoisonMessageError(`No schema for ${env.type}@${env.version}`);
      }

      if (allowedVersions && !allowedVersions.includes(env.version)) {
        throw new PoisonMessageError(`Version not accepted: ${env.type}@${env.version}`);
      }

      const parsed = schema.safeParse(env.data);
      if (!parsed.success) {
        throw new PoisonMessageError(parsed.error.message);
      }

      await handler(parsed.data as TData, context);
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

      // ✅ Use termInvalid correctly
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
