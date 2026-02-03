/* eslint-disable @typescript-eslint/no-explicit-any */
import { headers } from 'nats';

import { getNats } from '../client/connection';
import { HDR } from '../constants';
import { makeEnvelope } from '../envelope';
import { getLatestVersion, getSchemaForVersion, isEventFamily } from '../event-def';
import { setHeader } from '../utils';
import { encodeJson } from '../utils/codec';

export interface PublishOptions {
  /**
   * If you pass msgId, JetStream can de-duplicate publishes (if configured).
   * If omitted, we use envelope id.
   */
  msgId?: string;
  correlationId?: string;
  causationId?: string;
  traceparent?: string;
  /**
   * For EventFamily only: pick version to publish.
   * If omitted: publishes latest.
   */
  version?: number;
}

interface PublishEventResult {
  eventId: string;
  version: number;
}

export async function publishEvent<TData>(def: any, data: TData, opts?: PublishOptions): Promise<PublishEventResult> {
  const { client, logger } = getNats();

  const subject: string = def.subject;
  const type: string = def.type;

  const version = isEventFamily(def) ? (opts?.version ?? getLatestVersion(def)) : def.version;
  const schema = getSchemaForVersion(def, version);

  if (!schema) {
    throw new Error(`publishEvent: no schema for ${type}@${version}`);
  }

  // Validate payload (fail fast)
  const parsed = schema.parse(data);

  const env = makeEnvelope({
    subject,
    type,
    version,
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

  await client.publish(subject, encodeJson(env), {
    msgID: opts?.msgId ?? env.id,
    headers: h,
  });

  logger.debug('[nats] published', { subject, eventId: env.id, version });

  return { eventId: env.id, version };
}
