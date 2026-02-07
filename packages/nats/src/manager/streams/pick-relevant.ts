import type { StreamConfig } from 'nats';
import { StorageType } from 'nats';

import type { RelevantStreamFields } from './types';

export function pickStreamRelevant({
  subjects,
  storage,
  max_age,
  max_msgs,
  num_replicas,
}: Partial<StreamConfig>): RelevantStreamFields {
  return {
    subjects: subjects ?? [],
    storage: storage ?? StorageType.File,
    max_age: max_age ?? 0,
    max_msgs: max_msgs ?? -1,
    num_replicas: num_replicas ?? 1,
  };
}
