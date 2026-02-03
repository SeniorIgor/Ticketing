import { headers } from 'nats';

import { getNats } from '../client/connection';
import { HDR } from '../constants';
import { makeEnvelope } from '../envelope';
import type { EventDef } from '../event-def';
import type { Subject } from '../subjects';
import { setHeader } from '../utils';
import { encodeJson } from '../utils/codec';

export interface PublishOptions {
  msgId?: string;
  correlationId?: string;
  causationId?: string;
  traceparent?: string;
}

export async function publishEvent<TSubject extends Subject, TData>(
  def: EventDef<TSubject, TData>,
  data: TData,
  opts?: PublishOptions,
): Promise<{ eventId: string }> {
  const { client, logger } = getNats();

  // Validate payload (fail fast)
  const parsed = def.schema.parse(data);

  const env = makeEnvelope({
    subject: def.subject,
    type: def.type,
    version: def.version,
    data: parsed,
    meta: { correlationId: opts?.correlationId, causationId: opts?.causationId },
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
