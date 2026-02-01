/* eslint-disable @typescript-eslint/no-explicit-any */
import type { DeliverPolicy } from 'nats';
import { AckPolicy } from 'nats';

import { getNats } from '../connection';

type ReconcileMode = 'none' | 'warn' | 'update';

export async function ensureDurableConsumer(params: {
  stream: string;
  durable: string;
  filterSubjects: string[];
  deliverPolicy?: DeliverPolicy;
  ackWaitNs?: number;
  maxDeliver?: number;
  maxAckPending?: number;
  reconcile?: ReconcileMode;
}) {
  const { jsm, logger } = getNats();

  const desired = {
    durable_name: params.durable,
    ack_policy: AckPolicy.Explicit,
    filter_subjects: params.filterSubjects,
    deliver_policy: params.deliverPolicy,
    ack_wait: params.ackWaitNs,
    max_deliver: params.maxDeliver,
    max_ack_pending: params.maxAckPending,
  };

  try {
    const info = await jsm.consumers.info(params.stream, params.durable);
    const current = info.config as any;

    const drift =
      JSON.stringify(current.filter_subjects ?? []) !== JSON.stringify(desired.filter_subjects ?? []) ||
      current.ack_wait !== desired.ack_wait ||
      current.max_deliver !== desired.max_deliver ||
      current.max_ack_pending !== desired.max_ack_pending ||
      current.deliver_policy !== desired.deliver_policy;

    if (!drift) {
      return;
    }

    const mode = params.reconcile ?? 'warn';
    if (mode === 'none') {
      return;
    }

    logger.warn('[nats] consumer config drift detected', {
      stream: params.stream,
      durable: params.durable,
      current: pickRelevant(current),
      desired: pickRelevant(desired),
    });

    if (mode === 'update') {
      const updater = (jsm.consumers as any).update;
      if (typeof updater === 'function') {
        await updater.call(jsm.consumers, params.stream, params.durable, desired);
        logger.info('[nats] consumer updated', { stream: params.stream, durable: params.durable });
      } else {
        logger.warn('[nats] consumer update not supported by this nats.js version; keeping existing config');
      }
    }
  } catch {
    await jsm.consumers.add(params.stream, desired as any);
    logger.info('[nats] consumer created', { stream: params.stream, durable: params.durable });
  }
}

function pickRelevant(cfg: any) {
  return {
    filter_subjects: cfg.filter_subjects,
    deliver_policy: cfg.deliver_policy,
    ack_wait: cfg.ack_wait,
    max_deliver: cfg.max_deliver,
    max_ack_pending: cfg.max_ack_pending,
  };
}
