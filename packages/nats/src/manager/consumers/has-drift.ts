import type { ConsumerConfig } from 'nats';

import type { RelevantConsumerConfig } from '../../types';
import { sameStringArray } from '../../utils';

import { pickConsumerRelevant } from './pick-relevant';

export function hasConsumerDrift(
  currentConfig: ConsumerConfig | RelevantConsumerConfig,
  desiredConfig: ConsumerConfig | RelevantConsumerConfig,
): boolean {
  const current = pickConsumerRelevant(currentConfig);
  const desired = pickConsumerRelevant(desiredConfig);

  const cFilters = [...(current.filter_subjects ?? [])].sort();
  const dFilters = [...(desired.filter_subjects ?? [])].sort();

  if (!sameStringArray(cFilters, dFilters)) {
    return true;
  }

  return (
    current.deliver_policy !== desired.deliver_policy ||
    current.ack_wait !== desired.ack_wait ||
    current.max_deliver !== desired.max_deliver ||
    current.max_ack_pending !== desired.max_ack_pending
  );
}
