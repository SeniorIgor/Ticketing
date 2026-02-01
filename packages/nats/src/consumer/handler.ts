import type { MsgHdrs } from 'nats';

export type MessageContext = {
  stream: string;
  consumer: string;
  subject: string;

  seq?: number;
  delivered?: number;

  correlationId?: string;
  causationId?: string;
  traceparent?: string;

  headers?: MsgHdrs;
};

export type EventHandler<TData> = (data: TData, context: MessageContext) => Promise<void>;
