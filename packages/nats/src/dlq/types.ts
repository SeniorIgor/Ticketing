import type { RelevantConsumerConfig } from '../types';

export interface DeadLetterRecord extends Pick<RelevantConsumerConfig, 'durable_name'> {
  originalSubject: string;
  stream: string;

  seq?: number;
  delivered?: number;

  error: string;
  raw?: string;

  headers?: Record<string, string>;
  at: string;
}
