import type { StreamConfig } from 'nats';

import { sameStringArray } from '../../utils';

import { pickStreamRelevant } from './pick-relevant';

export function hasStreamDrift(currentConfig: Partial<StreamConfig>, desiredConfig: Partial<StreamConfig>): boolean {
  const current = pickStreamRelevant(currentConfig);
  const desired = pickStreamRelevant(desiredConfig);

  const cSubjects = [...(current.subjects ?? [])].sort();
  const dSubjects = [...(desired.subjects ?? [])].sort();

  if (!sameStringArray(cSubjects, dSubjects)) {
    return true;
  }

  return (
    current.max_age !== desired.max_age ||
    current.max_msgs !== desired.max_msgs ||
    current.storage !== desired.storage ||
    current.num_replicas !== desired.num_replicas
  );
}
