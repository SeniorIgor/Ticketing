/* eslint-disable @typescript-eslint/no-explicit-any */
import { StorageType } from 'nats';

import { getNats } from '../connection';

type ReconcileMode = 'none' | 'warn' | 'update';

export async function ensureStream(params: {
  stream: string;
  subjects: string[];
  storage?: StorageType;
  maxAgeNs?: number;
  maxMsgs?: number;
  replicas?: number;
  reconcile?: ReconcileMode;
}) {
  const { jsm, logger } = getNats();

  const desired = {
    name: params.stream,
    subjects: params.subjects,
    storage: params.storage ?? StorageType.File,
    max_age: params.maxAgeNs,
    max_msgs: params.maxMsgs,
    num_replicas: params.replicas,
  };

  try {
    const info = await jsm.streams.info(params.stream);
    const current = info.config as any;

    const drift =
      JSON.stringify(current.subjects ?? []) !== JSON.stringify(desired.subjects ?? []) ||
      current.max_age !== desired.max_age ||
      current.max_msgs !== desired.max_msgs ||
      current.storage !== desired.storage ||
      current.num_replicas !== desired.num_replicas;

    if (!drift) {
      return;
    }

    const mode = params.reconcile ?? 'warn';
    if (mode === 'none') {
      return;
    }

    logger.warn('[nats] stream config drift detected', {
      stream: params.stream,
      current: pickRelevant(current),
      desired: pickRelevant(desired),
    });

    if (mode === 'update') {
      await jsm.streams.update(params.stream, desired as any);
      logger.info('[nats] stream updated', { stream: params.stream });
    }
  } catch {
    await jsm.streams.add(desired as any);
    logger.info('[nats] stream created', { stream: params.stream });
  }
}

function pickRelevant(cfg: any) {
  return {
    subjects: cfg.subjects,
    storage: cfg.storage,
    max_age: cfg.max_age,
    max_msgs: cfg.max_msgs,
    num_replicas: cfg.num_replicas,
  };
}
