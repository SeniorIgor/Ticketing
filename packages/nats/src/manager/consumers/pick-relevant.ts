import type { ConsumerConfig } from 'nats';

import type { RelevantConsumerConfig } from '../../types';

type RelevantConsumerFields = Pick<
  ConsumerConfig,
  'filter_subjects' | 'deliver_policy' | 'ack_wait' | 'max_deliver' | 'max_ack_pending'
>;

export function pickConsumerRelevant({
  filter_subjects,
  deliver_policy,
  ack_wait,
  max_deliver,
  max_ack_pending,
}: RelevantConsumerConfig | ConsumerConfig): RelevantConsumerFields {
  return {
    filter_subjects,
    deliver_policy,
    ack_wait,
    max_deliver,
    max_ack_pending,
  };
}
