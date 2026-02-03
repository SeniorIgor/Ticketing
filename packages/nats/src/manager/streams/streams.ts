import { getNats } from '../../connection/connection';

import { buildStreamAddConfig, buildStreamUpdateConfig } from './build-config';
import { hasStreamDrift } from './has-drift';
import { pickStreamRelevant } from './pick-relevant';
import type { EnsureStreamParams } from './types';

export async function ensureStream(params: EnsureStreamParams) {
  const { manager, logger } = getNats();

  const desiredAdd = buildStreamAddConfig(params);
  const desiredUpdate = buildStreamUpdateConfig(params);

  try {
    const info = await manager.streams.info(params.stream);
    const current = info.config;

    const drift = hasStreamDrift(current, desiredAdd);

    if (!drift) {
      return;
    }

    const mode = params.reconcile ?? 'warn';
    if (mode === 'none') {
      return;
    }

    logger.warn('[nats] stream config drift detected', {
      stream: params.stream,
      current: pickStreamRelevant(current),
      desired: pickStreamRelevant(desiredAdd),
    });

    if (mode === 'update') {
      await manager.streams.update(params.stream, desiredUpdate);
      logger.info('[nats] stream updated', { stream: params.stream });
    }
  } catch {
    await manager.streams.add(desiredAdd);
    logger.info('[nats] stream created', { stream: params.stream });
  }
}
