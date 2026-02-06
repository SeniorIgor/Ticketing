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

  // Always compare filter_subjects if you always set them (you do).
  const cFilters = [...(current.filter_subjects ?? [])].sort();
  const dFilters = [...(desired.filter_subjects ?? [])].sort();
  if (!sameStringArray(cFilters, dFilters)) {
    return true;
  }

  // deliver_policy you always pass, so compare
  if (current.deliver_policy !== desired.deliver_policy) {
    return true;
  }

  // Only compare if desired explicitly specifies a value
  if (desired.ack_wait !== undefined && current.ack_wait !== desired.ack_wait) {
    return true;
  }

  if (desired.max_deliver !== undefined && current.max_deliver !== desired.max_deliver) {
    return true;
  }

  if (desired.max_ack_pending !== undefined && current.max_ack_pending !== desired.max_ack_pending) {
    return true;
  }

  return false;
}
