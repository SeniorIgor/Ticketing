import type { StreamConfig } from 'nats';

import type { ReconcileMode } from '../types';

export type RelevantStreamFields = Pick<StreamConfig, 'subjects' | 'storage' | 'max_age' | 'max_msgs' | 'num_replicas'>;

export interface EnsureStreamParams extends Partial<RelevantStreamFields> {
  stream: string;
  reconcile?: ReconcileMode;
}
