import type { JsMsg, MsgHdrs } from 'nats';

import { HDR } from '../../constants';
import type { MessageContext, RelevantConsumerConfig } from '../../types';
import { getHeader } from '../../utils';

interface BuildContextParams extends Pick<RelevantConsumerConfig, 'durable_name'> {
  stream: string;
  subject: string;
  headers: MsgHdrs | undefined;
  msg: JsMsg;
}

export function buildContext({ stream, durable_name, subject, headers, msg }: BuildContextParams): MessageContext {
  return {
    stream,
    durable_name,
    subject,
    seq: msg.info.streamSequence,
    delivered: msg.info.deliveryCount,
    correlationId: getHeader(headers, HDR.correlationId),
    causationId: getHeader(headers, HDR.causationId),
    traceparent: getHeader(headers, HDR.traceparent),
    headers,
  };
}
