import type { MsgHdrs } from 'nats';

import type { RelevantConsumerConfig } from './consumer-config';

export interface MessageContext extends Pick<RelevantConsumerConfig, 'durable_name'> {
  stream: string;
  subject: string;

  seq?: number;
  delivered?: number;

  correlationId?: string;
  causationId?: string;
  traceparent?: string;

  headers?: MsgHdrs;
}
