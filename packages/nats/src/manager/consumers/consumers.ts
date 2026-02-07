import { getNats } from '../../connection/connection';

import { buildConsumerConfig } from './build-config';
import { hasConsumerDrift } from './has-drift';
import { pickConsumerRelevant } from './pick-relevant';
import type { EnsureDurableConsumerParams } from './types';

export async function ensureDurableConsumer(params: EnsureDurableConsumerParams) {
  const { manager, logger } = getNats();

  const desired = buildConsumerConfig(params);

  try {
    const info = await manager.consumers.info(params.stream, params.durable_name);
    const current = info.config;
    const drift = hasConsumerDrift(current, desired);

    if (!drift) {
      return;
    }

    const mode = params.reconcile ?? 'warn';
    if (mode === 'none') {
      return;
    }

    logger.warn('[nats] consumer config drift detected', {
      stream: params.stream,
      durable_name: params.durable_name,
      current: pickConsumerRelevant(current),
      desired: pickConsumerRelevant(desired),
    });

    if (mode === 'update') {
      await manager.consumers.update(params.stream, params.durable_name, desired);

      logger.info('[nats] consumer updated', { stream: params.stream, durable_name: params.durable_name });
    }
  } catch {
    // Typically means "not found" (or permissions / network). We create the consumer.
    await manager.consumers.add(params.stream, desired);
    logger.info('[nats] consumer created', { stream: params.stream, durable_name: params.durable_name });
  }
}
