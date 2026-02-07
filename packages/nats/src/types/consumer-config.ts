import type { ConsumerConfig } from 'nats';

export type RelevantConsumerConfig = Pick<
  ConsumerConfig,
  'filter_subjects' | 'deliver_policy' | 'ack_wait' | 'max_deliver' | 'max_ack_pending'
> & {
  durable_name: string;
};
