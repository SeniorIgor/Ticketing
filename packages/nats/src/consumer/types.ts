/* eslint-disable @typescript-eslint/no-explicit-any */
import type z from 'zod';

import type { EventDef, EventFamily } from '../event-def';
import type { MessageContext, RelevantConsumerConfig } from '../types';

export type ContractDef<TSubject extends string> = EventDef<TSubject, any> | EventFamily<TSubject>;

export interface PullWorkerOptions<TSubject extends string> extends RelevantConsumerConfig {
  stream: string;
  /**
   * Preferred: contract definition (single version or family).
   */
  def?: ContractDef<TSubject>;
  /**
   * Optional: override/extend schema lookup (advanced).
   * If provided, this wins over def schema(s).
   */
  schemaByVersion?: Record<number, z.ZodTypeAny>;
  /**
   * Optional: allow these versions only.
   * If omitted: any version that has a schema is accepted.
   */
  acceptVersions?: number[];

  // fetch tuning
  batchSize?: number;
  expiresMs?: number;

  // concurrency
  concurrency?: number;

  // consumer config (only applied if ensure=true)
  ensure?: boolean;

  // DLQ + invalid payload behavior
  deadLetterSubject?: string;
  termInvalid?: boolean; // default true (if false -> nak poison)
  loggerName?: string;
}

export interface CreatePullWorkerResult {
  stop: () => void;
}

export type PullWorkerEventHandler<TData> = (data: TData, context: MessageContext) => Promise<void>;
