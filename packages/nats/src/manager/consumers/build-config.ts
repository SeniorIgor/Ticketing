import type { ConsumerConfig } from 'nats';
import { AckPolicy } from 'nats';

import type { RelevantConsumerConfig } from '../../types';

import type { EnsureDurableConsumerParams } from './types';

type BuildConsumerConfigResults = Pick<ConsumerConfig, 'ack_policy'> & RelevantConsumerConfig;

export function buildConsumerConfig({
  durable_name,
  filter_subjects,
  deliver_policy,
  ack_wait,
  max_deliver,
  max_ack_pending,
}: EnsureDurableConsumerParams): BuildConsumerConfigResults {
  return {
    durable_name,
    ack_policy: AckPolicy.Explicit,
    filter_subjects,
    deliver_policy,
    ack_wait,
    max_deliver,
    max_ack_pending,
  };
}
