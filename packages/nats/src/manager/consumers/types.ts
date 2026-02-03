import type { RelevantConsumerConfig } from '../../types';
import type { ReconcileMode } from '../types';

export interface EnsureDurableConsumerParams extends RelevantConsumerConfig {
  stream: string;
  reconcile?: ReconcileMode;
}
