import type { StreamConfig } from 'nats';
import { StorageType } from 'nats';

import type { EnsureStreamParams } from './types';

export function buildStreamAddConfig({
  max_age,
  max_msgs,
  stream,
  num_replicas,
  storage,
  subjects,
}: EnsureStreamParams): Partial<StreamConfig> {
  return {
    name: stream,
    subjects: subjects ?? [],
    storage: storage ?? StorageType.File,
    max_age,
    max_msgs,
    num_replicas,
  };
}

export function buildStreamUpdateConfig({
  stream,
  max_age,
  max_msgs,
  subjects,
}: EnsureStreamParams): Partial<StreamConfig> {
  return {
    name: stream,
    subjects,
    max_age,
    max_msgs,
  };
}
