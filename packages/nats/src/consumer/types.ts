import type { EventDef } from '../event-def';
import type { MessageContext, RelevantConsumerConfig } from '../types';

export interface PullWorkerOptions<TSubject extends string, TData> extends RelevantConsumerConfig {
  stream: string;
  def?: EventDef<TSubject, TData>; // recommended

  // fetch tuning
  batchSize?: number;
  expiresMs?: number;

  // concurrency
  concurrency?: number;

  // consumer config (only applied if ensure=true)
  ensure?: boolean;

  // DLQ + invalid payload behavior
  deadLetterSubject?: string; // e.g. "dlq.events"
  termInvalid?: boolean; // default true (if false -> nak poison)
  loggerName?: string;
}

export interface CreatePullWorkerResult {
  stop: () => void;
}

export type PullWorkerEventHandler<TData> = (data: TData, context: MessageContext) => Promise<void>;
