import { headers } from 'nats';

import { HDR, setHeader } from './observability/headers';
import { encodeJson } from './codec';
import { getNats } from './connection';
import type { EventDef } from './envelope';
import { makeEnvelope } from './envelope';

export type PublishOptions = {
  /**
   * If you pass msgId, JetStream can de-duplicate publishes (if configured).
   * If omitted, we use envelope id.
   */
  msgId?: string;
  correlationId?: string;
  causationId?: string;
  traceparent?: string;
};

export async function publishEvent<TSubject extends string, TData>(
  def: EventDef<TSubject, TData>,
  data: TData,
  opts?: PublishOptions,
): Promise<{ eventId: string }> {
  const { client, logger } = getNats();

  // Validate payload (fail fast)
  const parsed = def.schema.parse(data);

  const env = makeEnvelope(def, parsed, {
    correlationId: opts?.correlationId,
    causationId: opts?.causationId,
  });

  const h = headers();
  setHeader(h, HDR.eventId, env.id);
  setHeader(h, HDR.eventType, env.type);
  setHeader(h, HDR.eventVersion, String(env.version));
  setHeader(h, HDR.correlationId, env.correlationId);
  setHeader(h, HDR.causationId, env.causationId);
  setHeader(h, HDR.traceparent, opts?.traceparent);

  await client.publish(def.subject, encodeJson(env), {
    msgID: opts?.msgId ?? env.id,
    headers: h,
  });

  logger.debug('[nats] published', def.subject, env.id);
  return { eventId: env.id };
}
