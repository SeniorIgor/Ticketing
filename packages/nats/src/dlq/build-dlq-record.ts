import type { JsMsg } from 'nats';

import type { RelevantConsumerConfig } from '../types';
import { safeDecodeRaw } from '../utils';

import type { DeadLetterRecord } from './types';
import { headersToRecord } from './utils';

interface BuildDeadLetterRecordParams extends Pick<RelevantConsumerConfig, 'durable_name'> {
  msg: JsMsg;
  stream: string;
  error: unknown;
}

export function buildDeadLetterRecord({
  msg,
  stream,
  durable_name,
  error,
}: BuildDeadLetterRecordParams): DeadLetterRecord {
  return {
    originalSubject: msg.subject,
    stream,
    durable_name,
    seq: msg.info.streamSequence,
    delivered: msg.info.deliveryCount,
    error: error instanceof Error ? error.message : String(error),
    raw: safeDecodeRaw(msg.data),
    headers: headersToRecord(msg.headers),
    at: new Date().toISOString(),
  };
}
